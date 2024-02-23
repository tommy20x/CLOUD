import http from "./http.js";

const findAllCalendar = async function() {
    try {
        const response = await http.post("/hr/holidayCalFindAll")
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

const addCalendar = async function (name, day) {
    let jsonData = {
        "name": name,
        "monoff": day.monday,
        "tueoff": day.tuesday,
        "wedoff": day.wednesday,
        "thuoff": day.thursday,
        "frioff": day.friday,
        "satoff": day.saturday,
        "sunoff": day.sunday 
    }
    try {
        const response = await http.post("/hr/holidayCalAdd", jsonData)
        if (response.status == 200) {
            const data = response.data;
            return data.success
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const editCalendar = async function (calId, name, day) {
    let jsonData = {
        "holidayCalid": calId,
        "name": name,
        "monoff": day.monday,
        "tueoff": day.tuesday,
        "wedoff": day.wednesday,
        "thuoff": day.thursday,
        "frioff": day.friday,
        "satoff": day.saturday,
        "sunoff": day.sunday 
    }
    try {
        const response = await http.post("/hr/holidayCalEdit", jsonData)
        if (response.status == 200) {
            const data = response.data;
            return data.success
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const getHolidayList = async function (calId) {
    let jsonData = {
        "holidayCalid": calId
    }
    try {
        const response = await http.post("/hr/holidayListDates", jsonData)
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

const addHoliday = async function (date, reason, calId) {
    let jsonData = {
        "date": date,
        "reason": reason,
        "holidayCalid": calId
    }
    try {
        const response = await http.post("/hr/holidayDateAdd", jsonData)
        if (response.status == 200) {
            const data = response.data;
            return data.success
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const updateHoliday = async function (id, reason) {
    let jsonData = {
        "holidayid": id,
        "reason": reason
    }
    try {
        const response = await http.post("/hr/holidayUpdateReason", jsonData)
        if (response.status == 200) {
            const data = response.data;
            return data.success
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const removeHoliday = async function (id) {
    let jsonData = {
        "holidayid": id
    }
    try {
        const response = await http.post("/hr/holidayRemove", jsonData)
        if (response.status == 200) {
            const data = response.data;
            return data.success
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

export default {
    findAllCalendar,
    addCalendar,
    editCalendar,
    getHolidayList,
    addHoliday,
    updateHoliday,
    removeHoliday
}
