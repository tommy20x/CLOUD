import http from "./http.js";

const findAll = async function() {
    try {
        const response = await http.post("/common/roleFindAll")
        if (response.status == 200) {
            const data = response.data;
            if (data.success) {
                return data.response.allCarrierRecord
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return []
}

const findOne = async function (id) {
    const jsonData = {
        "id": id
    }
    try {
        const response = await http.post("/common/roleFindOne", jsonData)
        if (response.status == 200) {
            const data = response.data;
            if (data.success) {
                return data.response.allCarrierRecord
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return []
}

const add = async function(item) {
    try {
        const response = await http.post("/common/roleAddOne", item)
        if (response.status == 200) {
            const data = response.data;
            console.log("destination.add", data.response)
            if (data.success) {
                return data.response
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return null
}

const update = async function(item) {
    try {
        const response = await http.post("/common/roleUpdateOne", item)
        if (response.status == 200) return 1
    }
    catch (error) {
        console.log(error)
        return -1
    }
    return 0
}

const findAllRoles = async function() {
    try {
        const response = await http.post("/common/roleRoleTypes")
        if (response.status == 200) {
            const data = response.data;
            if (data.success) {
                return data.response.allCarrierRecord.roleTypes
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return []
}

const findAllMenus = async function() {
    try {
        const response = await http.post("common/getAllMenuPrevs")
        if (response.status == 200) {
            const data = response.data;
            if (data.success) {
                return data.response.allCarrierRecord
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return []
}

const saveMenu = async function (id, data) {
    let sendData = []
    data && data.length > 0 && data.forEach(e => {
        let p = []
        for (let i in e.selected) {
            if (e.selected[i]) {
                p.push(e.privileges[i])
            }
        }
        sendData.push({
            "menuid": e.menuid,
            "privileges": p
        })
    })

    const jsonData = {
        "roleid": id,
        "accessRights": sendData
    }
    console.log("save data", jsonData)
    try {
        const response = await http.post("/common/setMenuRole", jsonData)
        if (response.status == 200) {
            const data = response.data;
            // console.log("destination.add", data.response)
            // if (data.success) {
            //     return data.response
            // }
            return data.success
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

export default {
    findAll,
    add,
    update,
    findAllRoles,
    findOne,
    findAllMenus,
    saveMenu
}
