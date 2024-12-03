const { Server } = require('socket.io')


function setupWebSocket(server, db) {
    const io = new Server(server)

    io.on('connection', (socket) => {
        console.log("connected to web socket")

        // Enter Socket Room
        socket.on('ask-join', (roomId) => {
            socket.join(roomId);
        })

        socket.on('message', async (data) => {

            let messageInsertedResult = await db.collection('chatMessages').insertOne({
                chatId: new ObjectId(data.room),
                message: data.msg,
                userId: new ObjectId(data.userId),
                date: new Date()
            })
            let messageResult = await db.collection('chatMessages').findOne({
                _id: new ObjectId(messageInsertedResult.insertedId)
            })

            io.to(data.room).emit('broadcast', messageResult);
        })
    })
}

module.exports = setupWebSocket;