import http from "./http.js"
import associate from "./associate.js"

const getMyLeave = async function(hrId) {
    let data = {
        "hrid": hrId,
    }
    try {
        const response = await http.post("/hr/veiwMyLeave", data)
        if (response.status == 200) {
            const data = response.data;
            if (data.success) {
                let ret = await getNecessaryFromLeave(data.response.allCarrierRecord)
                return ret
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return []
}

const getNecessaryFromLeave = async function(ret) {
    let result = []
    let persons = await associate.findAll()

    ret && ret.length > 0 && ret.forEach(item => {
        let hrId = item.LAhrid ? item.LAhrid : 0
        let temp = {
            "id":item.LAid,
            "leaveFrom":item.leaveDateFrom,
            "leaveTo":item.leaveDateTo,
            "fromHalf":item.leaveDateFrom_halfDayLeave,
            "toHalf":item.leaveDateTo_halfDayLeave,
            "status":item.status,
            "reason":item.leaveReason,
            "leaveType": item.leaveType,
            "lastUpdateTimeStamp": item.lastUpdateTimeStamp,
            "hrId": hrId
        }
        if (hrId) {
            const person = persons.find(e => e.id == hrId)
            temp.name = person.firstname + ' ' + person.lastname
        }
        result.push(temp)
    })

    // result.sort((a, b) => (a.leaveFrom > b.leaveFrom) ? 1 : -1)
    // console.log("----------------result", result)
    return result
}

const applyLeave = async function(hrId, data) {
    let jsonData = {
        "hrid": hrId,
        "leaveType": data.leaveType,
        "leaveDateFrom": data.leaveDateFrom,
        "leaveDateFrom_halfDayLeave": data.fromHalf ? 1 : 0,
        "leaveDateTo": data.leaveDateTo,
        "leaveDateTo_halfDayLeave": data.toHalf ? 1 : 0,
        "leaveReason": data.leaveReason
    }
    try {
        const response = await http.post("/hr/leaveapply", jsonData)
        return (response.status == 200)
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const modifyLeave = async function(id, data) {
    let jsonData = {
        "id": id,
        "leaveType": data.leaveType,
        "leaveDateFrom": data.leaveDateFrom,
        "leaveDateFrom_halfDayLeave": data.fromHalf ? 1 : 0,
        "leaveDateTo": data.leaveDateTo,
        "leaveDateTo_halfDayLeave": data.toHalf ? 1 : 0,
        "leaveReason": data.leaveReason
    }
    try {
        const response = await http.post("/hr/leavemodify", jsonData)
        return (response.status == 200)
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const cancelLeaveByMe = async function(id, reason, lastTime) {
    let jsonData = {
        "action": "leave-cancelled-by-requestor",
        "cancelling_leave_application_id": id,
        "reason_for_cancellation": reason,
        "lastUpdateTimeStamp": lastTime
    }
    try {
        const response = await http.post("/hr/cancelLeavebyMe", jsonData)
        return (response.status == 200)
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const approveLeaveByHR = async function(hrId, id, lastTime, balance) {
    let jsonData = {
        "approving_hr_id": hrId,
        "approving_leave_application_id": id,
        "lastUpdateTimeStamp": lastTime,
        "reduceBalance": balance ? balance : 0
    }
    console.log("approve hr", jsonData)
    try {
        const response = await http.post("/hr/approveLeavebyHR", jsonData)
        return (response.status == 200)
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const cancelLeaveByHR = async function(hrId, id, lastTime) {
    let jsonData = {
        "cancelling_hr_id": hrId,
        "cancelling_leave_application_id": id,
        "lastUpdateTimeStamp": lastTime
    }
    try {
        const response = await http.post("/hr/cancelLeavebyHR", jsonData)
        return (response.status == 200)
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const getIndividualBalance = async function(date, hrId) {
    let jsonData = {
        "action":"getIndividualBalance",
        "asOnDate": date,
        "hrid": hrId
    }
    try {
        const response = await http.post("/hr/hrTxn", jsonData)
        if (response.status == 200) {
            const data = response.data;
            if (data.success) {
                return data.response.allCarrierRecord[0].indi_balance
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return []
}

const getAllLeave = async function() {
    try {
        const response = await http.post("/hr/listAllLeaveApplications")
        if (response.status == 200) {
            const data = response.data;
            if (data.success) {
                let ret = await getNecessaryFromLeave(data.response.allCarrierRecord)
                return ret
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return []
}

const allLeaveBalance = async function (date) {
    let jsonData = {
        "effectiveDate": date ? date : getCurrentDate()
    }
    try {
        const response = await http.post("/hr/listAllLeaveBalSummary", jsonData)
        if (response.status == 200) {
            const data = response.data;
            if (data.success) {
                let ret = data.response.allCarrierRecord
                let result = []
                if (ret && ret.length > 0) {
                    for (var i in ret) {
                        let item = ret[i]
                        result.push({
                            hrid: item.hrid,
                            name: item.firstname + " " + item.lastname,
                            leavebal: item.leavebal,
                            designation: item.designationname
                        })
                    }
                }
                return result
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return []
}

const getLeaveBalanceDetails = async function (date, hrId) {
    let jsonData = {
        "effectiveDate": date ? date : getCurrentDate(),
        "txn_for_hrid": hrId
    }
    try {
        const response = await http.post("/hr/listSpecififLeaveBalDetails", jsonData)
        if (response.status == 200) {
            const data = response.data;
            if (data.success) {
                let ret = data.response.allCarrierRecord
                let result = []
                ret && ret.length > 0 && ret.forEach(item => {
                    console.log("-------------item", item)
                    result.push({
                        addBalance: item.addBalance,
                        reduceBalance: item.reduceBalance,
                        txnEvent: item.txnEvent,
                        date: item.effectiveDate
                    })
                })
                return result
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return []
}

const adjustBalance = async function(data) {
    let jsonData = {
        "txn_for_hrid": data.hrId,
        "effectiveDate": data.date,
        "addBalance": data.type == "Add" ? data.amount : 0,
        "reduceBalance": data.type == "Reduce" ? data.amount : 0,
        "txnEvent": "leave-balance-add-by-hr-team"
    }
    try {
        const response = await http.post("/hr/leaveBalanceAdjust", jsonData)
        console.log("response", response)
        return (response.status == 200)
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const getCurrentDate = function () {
    const date = new Date()
    return (1900 + date.getYear()) + '-' + (date.getMonth() + 1) + '-' + date.getDate()
}

export default {
    getMyLeave,
    applyLeave,
    modifyLeave,
    cancelLeaveByMe,
    approveLeaveByHR,
    cancelLeaveByHR,
    getIndividualBalance,
    getAllLeave,
    allLeaveBalance,
    getLeaveBalanceDetails,
    getCurrentDate,
    adjustBalance
}
