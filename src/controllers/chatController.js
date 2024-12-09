const Chat = require("../models/chat");
const Shop = require("../models/shop");
const User = require("../models/user");

// create chat, if chat exist return old chat, if new chat return new chat
const createChat = async (req, res) => {
    try {
        const { id } = req.params;
        let shop;
        let customer = await User.findById(id); // find customer by id 
        if (customer) {
            shop = await Shop.findOne({user: req.user.id}); // find shop by customer id
        }else{
            shop = await Shop.findById(id); // find shop by id
            customer = await User.findById(req.user.id);
        }
        console.log(customer._id, shop._id);
        const chat = await Chat.findOne({ 
            users: { $all: [customer._id, shop._id] } 
        });

        if (chat) {
            return res.status(200).json(chat);
        }

        const newChat = Chat.create({
            users: [customer._id, shop._id],
            customerMessages: [],
            shopMessages: [],
        });

        res.status(200).json({status:"success", newChat});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateChat = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id );
        const content = req.body;
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        let user = await User.findById(req.params.userId);
        let shop;
        if (!user) {
            shop = await Shop.findById(req.params.userId);
            chat.shopMessages.push(content);
        } else {
            chat.customerMessages.push(content);
        }
        await chat.save();
        console.log(chat);
        res.status(200).json({status:"success", chat});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteChat = async (req, res) => {
    try {
        const { id, userId } = req.params; // Lấy ID chat và ID user từ request

        // Tìm document chat
        const chat = await Chat.findById(id);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        // Kiểm tra nếu ID cần xoá có trong mảng users
        if (!chat.users.includes(userId)) {
            return res.status(400).json({ message: "User ID not found in chat" });
        }

        // Loại bỏ userId khỏi mảng users
        chat.users = chat.users.filter(id => id !== userId);

        // Lưu thay đổi
        await chat.save();

        res.status(200).json({
            message: "User removed from chat successfully",
            updatedChat: chat
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllChatById = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID từ params

        // Tìm các chat mà mảng users chứa ID được truyền vào
        const chats = await Chat.find({ users: id });

        // Kiểm tra nếu không tìm thấy chat nào
        if (!chats || chats.length === 0) {
            return res.status(404).json({ message: "Chats not found" });
        }

        // Trả về kết quả
        res.status(200).json({ status: "success", chats });
    } catch (error) {
        // Xử lý lỗi và trả về phản hồi
        res.status(500).json({ message: error.message });
    }
};


module.exports = { createChat,updateChat, deleteChat,getAllChatById };