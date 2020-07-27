const users = []

// addUser, remoceUser, getUser, getUserRoom

addUser = ({id, username, room}) => {

    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if (!username || !room) {
        return {
            error: 'username & room are required!'
        }
    }

    //check the existing user
    const existingUser = users.find((user) => ((user.room === room) && (user.username === username)))

    //validate username
    if (existingUser) {
        return {
            error: 'username is in use!'
        } 
    }

    const user = {id, username, room}
    users.push(user)

    return {user}

}

const removedUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUserInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removedUser,
    getUser,
    getUserInRoom
}
