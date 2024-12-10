const UserModel = require("../models/user");

// api: get user
const getUser = async (req, res, next) => {
  try {
    console.log(res)
    //if check authentication wrong then return error
    if (!res.locals.isAuth)
      return res
        .status(400)
        .json({ message: 'Không thể lấy thông tin user', error });
    //else get information user -> send client
    const { _id } = req.user;
    const infoUser = await UserModel.findOne({ _id })
    .populate({
      path: 'role',
      select: 'name -_id',
    });

    res.status(200).json({ user: infoUser });
  } catch (error) {
    res.status(400).json({ message: 'Không thể lấy thông tin user', error });
  }
};

// api: update user
const putUpdateUser = async (req, res, next) => {
  try {
    const { userId, value } = req.body;
    if (await UserModel.exists({ _id: userId })) {
      const response = await UserModel.updateOne({ _id: userId }, { ...value });
      if (response) {
        return res.status(200).json({ message: 'success' });
      }
    } else {
      return res.status(409).json({ message: 'Tài khoản không tồn tại' });
    }
  } catch (error) {
    return res.status(409).json({ message: 'Cập nhật thất bại' });
  }
};

const getTotalUser = async (req, res, next) => {
  try {
    const totalUser = await UserModel.countDocuments();
    res.status(200).json({ totalUser });
  } catch (error) {
    res.status(400).json({ message: 'Không thể lấy thông tin user', error });
  }
};

//export
module.exports = {
  getUser,
  putUpdateUser,
  getTotalUser,
};
