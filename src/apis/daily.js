import http from "./http.js";

const dateToString = function (date) {
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();

    return yyyy + '-' + mm + '-' + dd;
}

const getToday = function() {
    var today = new Date();
    return dateToString(today)
}

const getYesterday = function () {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    return dateToString(yesterday)
}

const getDayByDiff = function (date, diff) {
    const day = new Date(date)
    const result = new Date(day)
    result.setDate(result.getDate() + diff)

    return dateToString(result)
}

const add1 = async function(today, taskId, roleId, supervisor, self, performer, hrs, mins, pct) {
    const jsonData = {
        "effortdate": today,
        "estimate_MP_taskL1id": taskId,
        "roleid": roleId,
        "workSupervisor_hrid": supervisor,
        "thisUpdateIsForSelfOther": self ? 'self' : 'other',
        "workPerformedBy_hrid": performer,
        "L1AdditionalTotMinsToday": Number(hrs) * 60 + Number(mins),
        "L1TotPctMarkToday": pct ? pct : null
    }

    console.log('add1 data', jsonData)
    try {
        const response = await http.post("/effort/duL1AddOne", jsonData)
        if (response.status == 200) {
            const data = response.data
            return data.response
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const add2 = async function(today, taskId, roleId, supervisor, self, performer, hrs, mins, pct) {
    const jsonData = {
        "effortdate": today,
        "estimate_MP_taskL2id": taskId,
        "roleid": roleId,
        "workSupervisor_hrid": supervisor,
        "thisUpdateIsForSelfOther": self ? 'self' : 'other',
        "workPerformedBy_hrid": performer,
        "L2AdditionalTotMinsToday": Number(hrs) * 60 + Number(mins),
        "L2TotPctMarkToday": pct ? pct : null
    }

    try {
        const response = await http.post("/effort/duL2AddOne", jsonData)
        if (response.status == 200) {
            const data = response.data
            return data.response
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const add3 = async function(today, taskId, roleId, supervisor, self, performer, hrs, mins, pct) {
    const jsonData = {
        "effortdate": today,
        "estimate_MP_taskL3id": taskId,
        "roleid": roleId,
        "workSupervisor_hrid": supervisor,
        "thisUpdateIsForSelfOther": self ? 'self' : 'other',
        "workPerformedBy_hrid": performer,
        "L3AdditionalTotMinsToday": Number(hrs) * 60 + Number(mins),
        "L3TotPctMarkToday": pct ? pct : null
    }

    try {
        const response = await http.post("/effort/duL3AddOne", jsonData)
        if (response.status == 200) {
            const data = response.data
            return data.response
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const add4 = async function(today, taskId, roleId, supervisor, self, performer, hrs, mins, pct) {
    const jsonData = {
        "effortdate": today,
        "estimate_MP_taskL4id": taskId,
        "roleid": roleId,
        "workSupervisor_hrid": supervisor,
        "thisUpdateIsForSelfOther": self ? 'self' : 'other',
        "workPerformedBy_hrid": performer,
        "L4AdditionalTotMinsToday": Number(hrs) * 60 + Number(mins),
        "L4TotPctMarkToday": pct ? pct : null
    }

    try {
        const response = await http.post("/effort/duL4AddOne", jsonData)
        if (response.status == 200) {
            const data = response.data
            return data.response
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const getUpdate1 = async function(hrId, date) {
    const jsonData = {
        "effortdate": date ? date : getToday(),
        "dataUpdated_hrid": hrId
    }

    try {
        const response = await http.post("/effort/L1getUpdatedRecordsByMe", jsonData)
        if (response.status == 200) {
            const data = response.data
            return data.response.allCarrierRecord
        }
    }
    catch (error) {
        console.log(error)
    }
    return []
}

const getUpdate2 = async function(hrId, date) {
    const jsonData = {
        "effortdate": date ? date : getToday(),
        "dataUpdated_hrid": hrId
    }

    try {
        const response = await http.post("/effort/L2getUpdatedRecordsByMe", jsonData)
        if (response.status == 200) {
            const data = response.data
            return data.response.allCarrierRecord
        }
    }
    catch (error) {
        console.log(error)
    }
    return []
}

const getUpdate3 = async function(hrId, date) {
    const jsonData = {
        "effortdate": date ? date : getToday(),
        "dataUpdated_hrid": hrId
    }

    try {
        const response = await http.post("/effort/L3getUpdatedRecordsByMe", jsonData)
        if (response.status == 200) {
            const data = response.data
            return data.response.allCarrierRecord
        }
    }
    catch (error) {
        console.log(error)
    }
    return []
}

const getUpdate4 = async function(hrId, date) {
    const jsonData = {
        "effortdate": date ? date : getToday(),
        "dataUpdated_hrid": hrId
    }

    try {
        const response = await http.post("/effort/L4getUpdatedRecordsByMe", jsonData)
        if (response.status == 200) {
            const data = response.data
            return data.response.allCarrierRecord
        }
    }
    catch (error) {
        console.log(error)
    }
    return []
}

const getUpdated = async function(level, id, type, date) {
    const jsonData = {
        "taskLevel_1_2_3_4": level,
        "est_MP_TLx_id": id,
        "performed_period": {
            "periodType": type, //daily
            "periodValue": date
        }
    }

    try {
        const response = await http.post("/effort/getUpdatedRecords", jsonData)
        if (response.status == 200) {
            const data = response.data
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

const remove1 = async function(id) {
    const jsonData = {
        "removing_DUL1_id": id
    }

    try {
        const response = await http.post("/effort/L1removeOneEntry", jsonData)
        if (response.status == 200) {
            const data = response.data
            return data.success
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const remove2 = async function(id) {
    const jsonData = {
        "removing_DUL2_id": id
    }

    try {
        const response = await http.post("/effort/L2removeOneEntry", jsonData)
        if (response.status == 200) {
            const data = response.data
            return data.success
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const remove3 = async function(id) {
    const jsonData = {
        "removing_DUL3_id": id
    }

    try {
        const response = await http.post("/effort/L3removeOneEntry", jsonData)
        if (response.status == 200) {
            const data = response.data
            return data.success
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const remove4 = async function(id) {
    const jsonData = {
        "removing_DUL4_id": id
    }

    try {
        const response = await http.post("/effort/L4removeOneEntry", jsonData)
        if (response.status == 200) {
            const data = response.data
            return data.success
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}


const getUpdatedList = async function(hrId, type, date) {
    const jsonData = {
        "performBy_hrid": hrId,
        "performPeriod": {
            "periodType": type,
            "value": date
        }
    }

    try {
        const response = await http.post("/effort/getListTasksForMe", jsonData)
        if (response.status == 200) {
            const data = response.data
            return data.response.allCarrierRecord[0]
        }
    }
    catch (error) {
        console.log(error)
    }
    return []
}

export default {
    add1,
    add2,
    add3,
    add4,
    getUpdate1,
    getUpdate2,
    getUpdate3,
    getUpdate4,
    remove1,
    remove2,
    remove3,
    remove4,
    getToday,
    getYesterday,
    getUpdated,
    getUpdatedList,
    getDayByDiff
}
