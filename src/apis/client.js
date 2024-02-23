import http from "./http.js";

const findAll = async function() {
    try {
        const response = await http.post("/common/clientFindAll")
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

const add = async function(client) {
    try {
        const response = await http.post("/common/clientAddOne", client)
        if (response.status == 200) {
            const data = response.data;
            console.log("api.AddClient", data.response)
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

const update = async function(client) {
    try {
        const response = await http.post("/common/clientUpdateOne", client)
        return (response.status == 200);
    }
    catch (error) {
        console.log(error)
        return false
    }
}

const findSupervisors = async function() {
    // data = {
    //     "specificType":"designation",
    //     "specificValue":"supervisor"
    // }
    // try {
    //     const response = await http.post("hr/hrFindSpecific", data)
    //     if (response.status == 200) {
    //         const data = response.data;
    //         if (data.success) {
    //             return data.response.allCarrierRecord
    //         }
    //     }
    // }
    // catch (error) {
    //     console.log(error)
    //     return false
    // }
    return [
        {
            "id": 1,
            "assocationType": "e",
            "assocationStatus": "joined",
            "JoinDateForResourcePlanning": null,
            "SeperationDateForResourcePlanning": null,
            "joinDate": "2018-01-01",
            "seperation": null,
            "holidaycalid": null,
            "personid": 1,
            "firstname": "Karthik U",
            "lastname": "K U",
            "DOB": "1980-12-31",
            "email": "pjaison!@gmail.com"
        },
        {
            "id": 2,
            "assocationType": "e",
            "assocationStatus": "joined",
            "JoinDateForResourcePlanning": null,
            "SeperationDateForResourcePlanning": null,
            "joinDate": "2018-01-02",
            "seperation": null,
            "holidaycalid": null,
            "personid": 2,
            "firstname": "Vijay",
            "lastname": "V",
            "DOB": "1980-01-02",
            "email": null
        },
        {
            "id": 8,
            "assocationType": "c",
            "assocationStatus": "joined",
            "JoinDateForResourcePlanning": "2022-05-01",
            "SeperationDateForResourcePlanning": "2022-05-20",
            "joinDate": "2022-06-01",
            "seperation": "2022-06-30",
            "holidaycalid": 1,
            "personid": 2,
            "firstname": "Vijay",
            "lastname": "V",
            "DOB": "1980-01-02",
            "email": null
        },
        {
            "id": 3,
            "assocationType": "e",
            "assocationStatus": "joined",
            "JoinDateForResourcePlanning": null,
            "SeperationDateForResourcePlanning": null,
            "joinDate": "2018-01-03",
            "seperation": null,
            "holidaycalid": null,
            "personid": 3,
            "firstname": "Ajeesh",
            "lastname": "A",
            "DOB": "1980-01-03",
            "email": null
        },
        {
            "id": 4,
            "assocationType": "e",
            "assocationStatus": "joined",
            "JoinDateForResourcePlanning": null,
            "SeperationDateForResourcePlanning": null,
            "joinDate": "2018-01-04",
            "seperation": null,
            "holidaycalid": null,
            "personid": 4,
            "firstname": "Nishanth",
            "lastname": "N",
            "DOB": "1980-01-04",
            "email": null
        }
    ]
}

const findL1Members = async function() {
    // data = {
    //     "specificType":"team-members",
    //     "specificValue":"Leve-1-members"
    // }
    // try {
    //     const response = await http.post("hr/hrFindSpecific", data)
    //     if (response.status == 200) {
    //         const data = response.data;
    //         if (data.success) {
    //             return data.response.allCarrierRecord
    //         }
    //     }
    // }
    // catch (error) {
    //     console.log(error)
    //     return false
    // }
    return [
        {
            "id": 6,
            "assocationType": "e",
            "assocationStatus": "joined",
            "JoinDateForResourcePlanning": null,
            "SeperationDateForResourcePlanning": null,
            "joinDate": "2018-01-06",
            "seperation": null,
            "holidaycalid": null,
            "personid": 6,
            "firstname": "Shiju",
            "lastname": "S",
            "DOB": "1980-01-06",
            "email": "shiju@uae.com"
        },
        {
            "id": 7,
            "assocationType": "e",
            "assocationStatus": "joined",
            "JoinDateForResourcePlanning": "2021-05-01",
            "SeperationDateForResourcePlanning": "2021-05-20",
            "joinDate": "2021-06-01",
            "seperation": "2021-06-30",
            "holidaycalid": 1,
            "personid": 7,
            "firstname": "Shaqlain",
            "lastname": "S",
            "DOB": "1980-01-07",
            "email": null
        }
    ]
}
export default {
    findAll,
    add,
    update,
    findSupervisors,
    findL1Members
}
