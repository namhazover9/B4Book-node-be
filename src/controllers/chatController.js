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
        const chat = await Chat.findById(req.params.id);
        const {content} = req.body;
        
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        // Kiểm tra xem user hay shop và thêm tin nhắn tương ứng
        let user = await User.findById(req.params.userId);
        let shop;
        if (!user) {
            shop = await Shop.findById(req.params.userId);
            if (!shop) {
                return res.status(404).json({ message: "Shop not found" });
            }
            chat.shopMessages.push({
                content: content,
                timestamp: new Date(),
            });
        } else {
            chat.customerMessages.push({
                content: content,
                timestamp: new Date(),
            });
        }

        await chat.save();
        res.status(200).json({
            status: "success",
            chat
        });
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
        // Kiểm tra user hoặc shop
        const customer = await User.findById(id);
        const shop = customer ? null : await Shop.findById(id);

        if (!customer && !shop) {
            return res.status(404).json({ message: "User or Shop not found" });
        }

        // Lấy danh sách chat liên quan
        const chats = await Chat.find({ users: id });

        if (!chats || chats.length === 0) {
            return res.status(404).json({ message: "Chats not found" });
        }

        // Lấy danh sách ID đối phương
        const otherUserIds = chats.map((chat) => chat.users.find((userId) => userId !== id));

        // Tìm tất cả thông tin đối phương trong một lần
        const otherInfos = customer
            ? await Shop.find({ _id: { $in: otherUserIds } }, "shopName images")
            : await User.find({ _id: { $in: otherUserIds } }, "userName avartar");

        // Map thông tin đối phương với chat
        const enrichedChats = chats.map((chat) => {
            const otherUserId = chat.users.find((userId) => userId !== id);
            const otherInfo = otherInfos.find((info) => info._id.toString() === otherUserId);

            return {
                ...chat._doc,
                otherInfo: otherInfo
                    ? customer
                        ? { type: "shop", name: otherInfo.shopName, avartar: otherInfo.images }
                        : { type: "customer", name: otherInfo.userName, avartar: otherInfo.avartar }
                    : null,
            };
        });
        // Trả về kết quả
        res.status(200).json({
            status: "success",
            userType: customer ? "customer" : "shop",
            chats: enrichedChats,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getChatById = async (req, res) => {
    try {
        const { id } = req.params;
        const chat = await Chat.findById(id);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        // Lấy thông tin của cả hai người tham gia trò chuyện
        const [customer, shop] = await Promise.all([
            User.findById(chat.users[0]), // Người dùng đầu tiên
            Shop.findById(chat.users[1]), // Shop thứ hai
        ]);

        if (!customer || !shop) {
            return res.status(404).json({ message: "Participants not found" });
        }

        // Gắn `senderId` cho từng tin nhắn
        const customerMessages = chat.customerMessages.map((msg) => ({
            ...msg,
            senderId: chat.users[0], // giả định user đầu tiên là customer
        }));
        const shopMessages = chat.shopMessages.map((msg) => ({
            ...msg,
            senderId: chat.users[1], // giả định user thứ hai là shop
        }));
        // Hợp nhất và sắp xếp theo thời gian
        const allMessages = [...customerMessages, ...shopMessages].sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
        // Kết quả trả về bao gồm thông tin avatar, tên của cả hai
        res.status(200).json({
            status: "success",
            chat: {
                ...chat._doc,
                participants: {
                    customer: {
                        name: customer.userName,
                        avatar: customer.avartar,
                        senderId: chat.users[0],
                    },
                    shop: {
                        name: shop.shopName,
                        avatar: shop.images[0],
                        senderId: chat.users[1],
                    },
                },
                messages: allMessages,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



module.exports = { createChat,updateChat, deleteChat,getAllChatById,getChatById };