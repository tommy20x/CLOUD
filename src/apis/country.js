import http from "./http.js";

const findAll = async function() {
    try {
        const response = await http.post("/common/countryFindAll")
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

const add = async function(country) {
    try {
        const response = await http.post("/common/countryAddOne", country)
        if (response.status == 200) {
            const data = response.data;
            console.log("api.addCountry", data.response)
            if (data.success) {
                return data.response
            }
        }
    }
    catch (error) {
        console.log(error)
        return false
    }
}

const update = async function(country) {
    try {
        const response = await http.post("/common/countryUpdateOne", country)
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
