import http from "./http.js";

const findAll = async function (firstName, lastName) {
    const jsonData = {
        "firstname_like_": firstName ? firstName : "",
        "lastname_like_": lastName ? lastName : ""
    }
    try {
        const response = await http.post("/hr/hrFindAll", jsonData)
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

const getAssociates = async function () {
    let associates = []
    try {
        const response = await http.post("/hr/hrFindAll")
        if (response.status == 200) {
            const data = response.data;
            if (data.success) {
                associates = data.response.allCarrierRecord
            }
        }
    }
    catch (error) {
        console.log(error)
    }

    return associates
}

const findOne = async function(id) {
    let data = {
        id: id
    }
    try {
        const response = await http.post("/hr/hrFindOne", data)
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

const add = async function(person) {
    console.log("add person", person)
    let data
    if (person.assocationStatus == 'toBeJoined') {
        data = {
            assocationType: person.assocationType,
            assocationStatus: person.assocationStatus,
            JoinDateForResourcePlanning: person.JoinDateForResourcePlanning,
            holidaycalid: person.holidaycalid,
            personid: person.personid
        }
    } else {
        data = person
    }
    try {
        const response = await http.post("/hr/hrAddOne", data)
        if (response.status == 200) {
            const data = response.data
            // if (person.assocationStatus == 'toBeJoined' || person.assocationStatus == 'seperated') {
            //     console.log("add no design")
            //     return true
            // } else {
            //     const ret = await addDesignation(data.response.data.insertId, person.designationDate, person.designation, 0)
            //     return ret
            // }
            console.log("after add data", data)
            return data.success
        }
    }
    catch (error) {
        console.log(error)
        return false
    }
}

const update = async function(person) {
    console.log("update person", person)

    let data
    if (person.assocationStatus == 'toBeJoined') {
        data = {
            id: person.id,
            assocationType: person.assocationType,
            assocationStatus: person.assocationStatus,
            JoinDateForResourcePlanning: person.JoinDateForResourcePlanning,
            holidaycalid: person.holidaycalid,
            personid: person.personid
        }
    } else {
        data = person
    }
    try {
        const response = await http.post("/hr/hrUpdateOne", data)
        if (response.status == 200) {
            if (person.assocationStatus == 'toBeJoined' || person.assocationStatus == 'seperated' || person.designationDate == person.initialDesignationDate) {
                console.log("update no design")
                return true
            } else {
                const ret = await addDesignation(person.id, person.designationDate, person.designation, person.initialDesignation ? person.initialDesignation : 0)
                return ret
            }
        }
    }
    catch (error) {
        console.log(error)
        return false
    }
}

const roleAssign = async function(hrId ,data, date) {
    let roleAction = []
    data.forEach(item => {
        item.data.effectivedate = date
        // item.data.effectivefromdate = date //todo remove
        if (item.data.recordType != "noAction" && item.data.recordType != "update") {
            // item.data.id = item.id //todo
            item.data.rolesid = item.id
            roleAction.push(item.data)
        }
    })
    console.log("before save", roleAction)
    let jsonData = {
        "hrid": hrId,
        "roleAction": roleAction
    }
    try {
        const response = await http.post("/hr/hrRolesAssign", jsonData)
        if (response.status == 200) {
            const data = response.data
            console.log("return role data", data)
            if (data.success) {
                return findOne(data.response.hrid)
            }
        }
            
    }
    catch (error) {
        console.log(error)
        return false
    }
}

const getRoleWithData = function (roles) {
    let store = []
    roles.forEach(item=> store.push(
        {
            "id":item.id, 
            "name": item.name,
            "roleType": item.roleType,
            "data": {
                "effectivedate": null,
                "recordType": "noAction",
                // "rolesid": item.id,
                "id": null
            },
        }
    ))
    return store
}

const addDesignation = async function(hrId, date, designationId, hrDesignationId, scaleCode) {
    let jsonData = {
        "hrid": hrId,
        "effectivefromdate": date,
        "designationid": designationId,
        "closingdesignation_hrDesignationid": hrDesignationId,
        "scaleCode": scaleCode
    }
    try {
        const response = await http.post("/hr/hrAddNewDesignation", jsonData)
        console.log("designation response", response)
        return (response.status == 200);
    }
    catch (error) {
        console.log(error)
        return false
    }
}

const getCurrentDate = function () {
    const date = new Date()
    return (1900 + date.getYear()) + '-' + (date.getMonth() + 1) + '-' + date.getDate()
}

export default {
    findAll,
    findOne,
    add,
    update,
    getRoleWithData,
    roleAssign,
    addDesignation,
    getAssociates
}
