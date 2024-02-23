import http from "./http.js";

const resetKeys = function(items, index) {
    let tasks = []
    for (const key in items) {
        const data = items[key]

        let tazk = Object.assign({}, data, { ikey: index, children: [], userAction: "nochange" })
        index++
        
        if (data.hasOwnProperty("children")) {
            const ret = resetKeys(data.children, index)
            tazk["children"] = ret.tasks
            index = ret.index
        }

        tasks.push(tazk)
    }        
    return {tasks, index};
}

const sortTask = async function(items) {
    items && items.length > 0 && items.sort((a, b) => {
        if (a.sortorder > b.sortorder)
            return 1
        if (a.sortorder < b.sortorder)
            return -1
        return 0
    })
    for (const key in items) {
        const data = items[key]
        if (data.hasOwnProperty("children")) {
            await sortTask(data.children)
        }
    }
}

const findAll = async function() {
    try {
        const response = await http.post("/taskCat/findAllTaskAndSubTasksF2")
        if (response.status == 200) {
            const data = response.data;
            if (data.success) {
                let items = data.response.allCarrierRecord.TaskCategory
                await sortTask(items)
                let {tasks, index} = resetKeys(items, 1)
                return tasks
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return []
}

const update = async function(tasks) {
    const postData = {
        saveThisRecord: {
            TaskCategory: tasks
        }
    }
    console.log("updated data", postData)
    const data = JSON.stringify(postData)
    try {
        const response = await http.post("/taskCat/updateAllTaskAndSubTasksF2", data)
        console.log(response)
        if (response.status == 200) {
            return true
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

export default {
    findAll,
    update,
    sortTask
}