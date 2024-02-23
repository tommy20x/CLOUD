import http from "./http.js";

const findAll = async function() {
    try {
        const response = await http.post("/common/designationFindAll")
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
        const response = await http.post("/common/designationAddOne", item)
        if (response.status == 200) {
            const data = response.data;
            const scalecodes = JSON.parse(data.response.scalecodes)
            data.response.scalecodes = scalecodes
            console.log("destination.add", data.response)

            if (data.success) {
                return data.response
            }
        }
    }
    catch (error) {
        console.log(error)
        return null
    }
    return null
}

const update = async function(item) {
    try {
        const response = await http.post("/common/designationUpdateOne", item)
        return (response.status == 200);
    }
    catch (error) {
        console.log(error)
        return false
    }
}

export default {
    findAll,
    add,
    update,
}
