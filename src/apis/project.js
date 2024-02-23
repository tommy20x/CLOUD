import moment from 'moment'
import http from "./http.js";
import task from "./task.js";
import associate from "./associate.js";

const getProjects = async function() {
    const tempList = await findAll()
    //TOOD---console.log("project.getProjects", tempList)
    if (!tempList) {
        return null
    }

    const project_list = await Promise.all(tempList.map(async (proj) => {
        const projects = await getProjectWithPhase(proj.prj_code)
        if (projects == null || projects.length <= 0) {
            return null
        }

        const project = projects[0]
        ////TOOD---console.log('project_______________', project.phases)
        if (project.phases) {
            const phases = await Promise.all(
                project.phases.map(async (phase) => {
                    const categories = await getProjectCategory(proj.prj_code, phase.phaseNumber)
                    //TOOD---console.log('categories', categories)
                    phase.serverItems = categories.map((it) => {
                        it.level = 0
                        it.name = it.taskCateg_name
                        return it
                    })
                    return phase
                })
            )
            project.phases = phases.filter(it => it != null)
        }

        return project
    }))

    const items = project_list.filter(proj => proj != null)
    //console.log("Projects-Result", items)
    return items
}

const setServerItem = async function (project) {
    if (project.phases) {
        const phases = await Promise.all(
            project.phases.map(async (phase) => {
                const categories = await getProjectCategory(project.prj_code, phase.phaseNumber)
                //TOOD---console.log('categories', categories)
                phase.serverItems = categories.map((it) => {
                    it.level = 0
                    it.name = it.taskCateg_name
                    return it
                })
                return phase
            })
        )
        project.phases = phases.filter(it => it != null)
    }
}

const getTaskByKeyInfo = async function (task) {
    if (task.level == 0) return await getTask1(task.info.est_MP_categ_id)
    if (task.level == 1) return await getTask2(task.info.est_MP_TL1_id)
    if (task.level == 2) return await getTask3(task.info.est_MP_TL2_id)
    if (task.level == 3) return await getTask4(task.info.est_MP_TL3_id)
    return null
}

const getTaskByLevel = async function (task, level) {
    // console.log("----task", task)
    if (level == 1) return await getTask1(task.est_MP_categ_id)
    if (level == 2) return await getTask2(task.est_MP_TL1_id)
    if (level == 3) return await getTask3(task.est_MP_TL2_id)
    if (level == 4) return await getTask4(task.est_MP_TL3_id)
    return null
}

const updateTasks = async function (tasks, level) {
    console.log("tasks", tasks, level)
    for (const i in tasks) {
        const tazk = tasks[i]
        tazk.children = await getTaskByLevel(tazk, level)
        tazk.level = level - 1           //TODO
        if (level < 4) {
            if (tazk.children && tazk.children.length > 0) {
                await updateTasks(tazk.children, level + 1)
            }
        }
    }

    return tasks
}

const updateTaskList = async function(project) {
    for (const i in project.phases) {
        const phase = project.phases[i]
        if (phase.serverItems) {
            phase.serverItems = await updateTasks(phase.serverItems, 1)
        }
        else {
            phase.serverItems = []
        }
    }
    project.updated = true
}

const getTree = async function() {
    const tasks = await task.findAll()
    addFieldToTask(tasks.children)
    return tasks
}

const addFieldToTask = function(obj) {
    for (var i in obj) {
        obj[i].dateFrom = ""
        obj[i].dateTo = ""
        obj[i].qty = 0
        obj[i].description = ""
        addFieldToTask(obj[i].children)
    }
}

const findAll = async function (code, name, refEnqNumber, clientName) {
    const jsonData = {
        "code": code ? code : "",
        "name": name ? name : "",
        "refEnqNumber": refEnqNumber ? refEnqNumber : "",
        "clientName": clientName ? clientName : ""
    }
    try {
        const response = await http.post("/plan/projectFindAll", jsonData)
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

const addProject = async function(project) {
    const data = {
        "code": project.prj_code,
        "name": project.prj_name,
        "clientid": project.cl_id,
        "presalesopendate": project.prj_presalesopendate,
        "presalesclosedate": project.prj_presalesclosedate,
        "executionopendate": project.prj_executionopendate,
        "executionclosedate": project.prj_executionclosedate,
        "warrantyopendate": project.prj_warrantyopendate,
        "warrantyclosedate": project.prj_warrantyclosedate,
        "refEnqNumber": project.prj_refEnqNumber,
        "projectmanagerhrid": project.prj_projectmanagerhrid
    }
    try {
        const response = await http.post("/plan/projectAddOne", data)
        if (response.status == 200)
            return 1
    }
    catch (error) {
        console.log(error.response.data)
        if (!error.response.data.success) {
            return -1
        }
    }
    return 0
}

const updateProject = async function(project) {
    console.log('update_project', project)
    const data = {
        "id": project.prj_id,
        "code": project.prj_code,
        "name": project.prj_name,
        "clientid": project.cl_id,
        "presalesopendate": project.prj_presalesopendate,
        "presalesclosedate": project.prj_presalesclosedate,
        "executionopendate": project.prj_executionopendate,
        "executionclosedate": project.prj_executionclosedate,
        "warrantyopendate": project.prj_warrantyopendate,
        "warrantyclosedate": project.prj_warrantyclosedate,
        "refEnqNumber": project.prj_refEnqNumber,
        "projectmanagerhrid": project.prj_projectmanagerhrid
    }
    try {
        const response = await http.post("/plan/projectUpdateOne", data)
        if (response.status == 200) {
            return 1
        }
    }
    catch (error) {
        console.log(error)
        return -1
    }
    return 0
}

const getProjectWithPhase = async function(projectCode) {
    const data = {
        "code": projectCode
    }
    try {
        const response = await http.post("/plan/projectFindOne", data)
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

const phaseSet = async function(projectId, phases) {
    const jsonData = {
        "prj_id": projectId,
        "phases": phases,
        "phasesToRemove": [],
    }

    try {
        const response = await http.post("/plan/projectPhaseSet", jsonData)
        if (response.status == 200) {
            return 1
        }
    }
    catch (error) {
        console.log(error)
        return -1
    }
    return 0
}

const getProjectCategory = async function(prjCode, phaseNumber) {
    const jsonData = {
        "action": "FETCH",
        "details": {
            "prj_code": prjCode,
            "phaseNumber": phaseNumber
        }
    };
    const result = await projectCategory(jsonData)
    if (result && result.success) {
        return result.response.allCarrierRecord
    }
    return null
}

const addProjectCategory = async function(phaseId, category) {
    const jsonData = {
        "action": "INCLUDE",
        "details": {
            "phase_id": phaseId,
            "addingCategoryid": category.id
        }
    };
    const result = await projectCategory(jsonData)
    if (result && result.success) {
        return result.response.allCarrierRecord.insertId
    }
    return null
}

const removeProjectCategory = async function(phaseId, category) {
    const jsonData = {
        "action": "EXCLUDE",
        "details": {
            "phase_id": phaseId,
            "removingCategoryid": category.info.est_MP_categ_taskCategoryID
        }
    }
    const result = await projectCategory(jsonData)
    return result && result.success
}

const projectCategory = async function(data) {
    try {
        const response = await http.post("/plan/projectCategory", data)
        //console.log('get_project_category', response.status)
        if (response.status == 200) {
            return response.data
        }
    }
    catch (error) {
        console.log(error)
    }
    return null
}

const getTask1 = async function(categoryId) {
    const data = {
        "action": "FETCH",
        "est_MP_categ_id": categoryId
    }
    //TOOD---console.log('get_task1', data)
    try {
        const response = await http.post("/plan/projectL1Task", data)
        console.log('get_task1_response', response)
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

const getTask2 = async function(task1Id) {
    const data = {
        "action":"FETCH",
        "est_MP_TL1_id": task1Id
    }
    try {
        const response = await http.post("/plan/projectL2Task", data)
        console.log('getTask2_response', response)
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

const getTask3 = async function(task2Id) {
    const data = {
        "action":"FETCH",
        "est_MP_TL2_id": task2Id
    }
    try {
        const response = await http.post("/plan/projectL3Task", data)
        console.log('getTask3_response', response)
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

const getTask4 = async function(task3Id) {
    const data = {
        "action":"FETCH",
        "est_MP_TL3_id": task3Id
    }
    try {
        const response = await http.post("/plan/projectL4Task", data)
        console.log('getTask4_response', response)
        if (response.status == 200) {
            const data = response.data;
            if (data.success) {
                return data.response.allCarrierRecord   //TODO
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return []
}

const saveTaskByLevel = async function (tazk, state, level) {
    if (level == 0) return await this.saveTask1(tazk, state)
    if (level == 1) return await this.saveTask2(tazk, state)
    if (level == 2) return await this.saveTask3(tazk, state)
    if (level == 3) return await this.saveTask4(tazk, state)
    return false
}

const saveTask1 = async function (tazk, state) {
    console.log('saveTask1--1', tazk)
    ////TOOD---console.log('saveTask1--1', tazk)
    for (const i in tazk.children) {
        const child = tazk.children[i]
        child.info.est_MP_TL1_level1taskid = child.id
    }
    
    let peoples = []
    const data = tazk.children.map((child) => {
        if (state.indexOf(child.state) < 0) {
            return null
        }
        const datefrom = child.datefrom || moment().format("YYYY-MM-DD")
        const dateto = child.dateto || moment().format("YYYY-MM-DD")

        // if (state != 'remove') {
        //     child.info.est_MP_TL1_id && allocateResource(child.info.est_MP_TL1_id, child.people, child.initial)
        //     child.people && child.people.length && peoples.push(child.people)
        // }

        return {
            "action": child.state,
            "est_MP_TL1_id": child.info.est_MP_TL1_id,
            "est_MP_TL1_level1taskid": child.id,                    //child.info.est_MP_TL1_level1taskid,
            "est_MP_TL1_level1taskDesc": child.description,         //info.est_MP_TL1_level1taskDesc,
            "est_MP_TL1_datefrom": datefrom,                        //child.info.est_MP_TL1_datefrom,
            "est_MP_TL1_dateto": dateto,                            //child.info.est_MP_TL1_dateto,  
            "est_MP_TL1_unitOfMeasure": child.unitOfMeasure,        //child.info.est_MP_TL1_unitOfMeasure,
            "est_MP_TL1_qty": child.quantity,                       //child.info.est_MP_TL1_qty
            "est_MP_TL1_backgroundColor": child.info.est_MP_TL1_backgroundColor,
            "est_MP_TL1_fontColor": child.info.est_MP_TL1_fontColor
        }
    })
    const postData = data.filter(it => it != null)
    if (postData.length <= 0) {
        return
    }
    const jsonData = {
        "action": "SAVE",
        "est_MP_categ_id": tazk.info.est_MP_categ_id,
        "dataToSave": postData
    }
    console.log('saveTask1--2', jsonData)
    try {
        const response = await http.post("/plan/projectL1TaskSave", jsonData)
        if (response.status == 200) {
            if (response.data && response.data.success) {
                // let ids = response.data.response.allCarrierRecord
                // ids && ids.length > 0 && ids.forEach( (e, i) => {
                //     e.insertId > 0 && peoples.length > 0 && allocateResource(e.insertId, peoples[i], [])
                // })
                return true
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return null
}

const saveTask2 = async function (tazk, state) {
    console.log('saveTask2--1', tazk)
    ////TOOD---console.log('saveTask2--1', tazk)
    for (const i in tazk.children) {
        const child = tazk.children[i]
        child.info.est_MP_TL2_level2taskid = child.id
    }

    const data = tazk.children.map((child) => {
        if (state.indexOf(child.state) < 0) {
            return null
        }
        return {
            "action": child.state,
            "est_MP_TL2_id": child.info.est_MP_TL2_id,
            "est_MP_TL2_level2taskid": child.info.est_MP_TL2_level2taskid,
            "est_MP_TL2_level2taskDesc": child.description, //child.info.est_MP_TL2_level2taskDesc,
            "est_MP_TL2_unitOfMeasure": child.unitOfMeasure, //child.info.est_MP_TL2_unitOfMeasure,
            "est_MP_TL2_qty": child.quantity, //child.info.est_MP_TL2_qty
            "est_MP_TL2_backgroundColor": child.info.est_MP_TL2_backgroundColor,
            "est_MP_TL2_fontColor": child.info.est_MP_TL2_fontColor
        }
    })
    const postData = data.filter(it => it != null)
    if (postData.length <= 0) {
        return
    }
    const jsonData = {
        "action": "SAVE",
        "est_MP_TL1_id": tazk.info.est_MP_TL1_id,
        "dataToSave": postData
    }
    console.log('saveTask2--2', jsonData)
    try {
        const response = await http.post("/plan/projectL2TaskSave", jsonData)
        if (response.status == 200) {
            if (response.data && response.data.success) {
                return true
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return null
}

const saveTask3 = async function (tazk, state) {
    console.log('saveTask3--1', tazk)
    ////TOOD---console.log('saveTask3--1', tazk)
    for (const i in tazk.children) {
        const child = tazk.children[i]
        child.info.est_MP_TL3_level3taskid = child.id
    }

    const data = tazk.children.map((child) => {
        if (state.indexOf(child.state) < 0) {
            return null
        }
        return {
            "action": child.state,
            "est_MP_TL3_id": child.info.est_MP_TL3_id,
            "est_MP_TL3_level3taskid": child.info.est_MP_TL3_level3taskid,
            "est_MP_TL3_level3taskDesc": child.description, //child.info.est_MP_TL3_level3taskDesc,
            "est_MP_TL3_unitOfMeasure": child.unitOfMeasure, //child.info.est_MP_TL3_unitOfMeasure,
            "est_MP_TL3_qty": child.quantity, //child.info.est_MP_TL3_qty
            "est_MP_TL3_backgroundColor": child.info.est_MP_TL3_backgroundColor,
            "est_MP_TL1=3_fontColor": child.info.est_MP_TL3_fontColor
        }
    })
    const postData = data.filter(it => it != null)
    if (postData.length <= 0) {
        return
    }
    const jsonData = {
        "action": "SAVE",
        "est_MP_TL2_id": tazk.info.est_MP_TL2_id,
        "dataToSave": postData
    }
    console.log('saveTask3--2', jsonData)
    try {
        const response = await http.post("/plan/projectL3TaskSave", jsonData)
        if (response.status == 200) {
            if (response.data && response.data.success) {
                return true
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return null
}

const saveTask4 = async function (tazk, state) {
    console.log('saveTask4--1', tazk)
    ////TOOD---console.log('saveTask4--1', tazk)
    for (const i in tazk.children) {
        const child = tazk.children[i]
        child.info.est_MP_TL4_level4taskid = child.id
    }

    const data = tazk.children.map((child) => {
        if (state.indexOf(child.state) < 0) {
            return null
        }
        return {
            "action": child.state,
            "est_MP_TL4_id": child.info.est_MP_TL4_id,
            "est_MP_TL4_level4taskid": child.info.est_MP_TL4_level4taskid,
            "est_MP_TL4_level4taskDesc": child.description, //child.info.est_MP_TL4_level4taskDesc,
            "est_MP_TL4_unitOfMeasure": child.unitOfMeasure, //child.info.est_MP_TL4_unitOfMeasure,
            "est_MP_TL4_qty": child.quantity, //child.info.est_MP_TL4_qty
            "est_MP_TL4_backgroundColor": child.info.est_MP_TL4_backgroundColor,
            "est_MP_TL4_fontColor": child.info.est_MP_TL4_fontColor
        }
    })
    const postData = data.filter(it => it != null)
    if (postData.length <= 0) {
        return
    }
    const jsonData = {
        "action": "SAVE",
        "est_MP_TL3_id": tazk.info.est_MP_TL3_id,
        "dataToSave": postData
    }
    console.log('saveTask4--2', jsonData)
    try {
        const response = await http.post("/plan/projectL4TaskSave", jsonData)
        if (response.status == 200) {
            if (response.data && response.data.success) {
                return true
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return null
}

const checkRemoveTaskByLevel = async function(taskId, level) {
    if (level == 1) return await this.checkRemoveTask1(taskId)
    if (level == 2) return await this.checkRemoveTask2(taskId)
    if (level == 3) return await this.checkRemoveTask3(taskId)
    if (level == 4) return await this.checkRemoveTask4(taskId)
    return false
}

const checkRemoveCategory = async function (phaseId) {
    const data = {
        "action": "phaseid-usage",
            "details": {
            "phase_id": phaseId
        }
    }
    try {
        const response = await http.post("/plan/projectCheckb4Remove", data)
        if (response.status == 200) {
            if (response.data.response.allCarrierRecord[0]._count == 0) {
                return true
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const checkRemoveTask1 = async function(taskId) {
    const data = {
        "action": "est_MP_TL1_id-usage",
        "details": {
            "est_MP_TL1_id": taskId
        }
    }
    try {
        const response = await http.post("/plan/projectCheckb4Remove", data)
        if (response.status == 200) {
            if (response.data.response.allCarrierRecord[0]._count == 0) {
                return true
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const checkRemoveTask2 = async function(taskId) {
    const data = {
        "action": "est_MP_TL2_id-usage",
        "details": {
            "est_MP_TL2_id": taskId
        }
    }
    try {
        const response = await http.post("/plan/projectCheckb4Remove", data)
        if (response.status == 200) {
            if (response.data.response.allCarrierRecord[0]._count == 0) {
                return true
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const checkRemoveTask3 = async function(taskId) {
    const data = {
        "action": "est_MP_TL3_id-usage",
        "details": {
            "est_MP_TL3_id": taskId
        }
    }
    try {
        const response = await http.post("/plan/projectCheckb4Remove", data)
        if (response.status == 200) {
            if (response.data.response.allCarrierRecord[0]._count == 0) {
                return true
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const checkRemoveTask4 = async function(taskId) {
    const data = {
        "action": "est_MP_TL4_id-usage",
        "details": {
            "est_MP_TL4_id": taskId
        }
    }
    
    try {
        const response = await http.post("/plan/projectCheckb4Remove", data)
        if (response.status == 200) {
            if (response.data.response.allCarrierRecord[0]._count == 0) {
                return true
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}


const allocateResource = async function (id, current, initial) {
    if (Object.is(current, initial)) return
    
    let include = current.length > 0 && current.filter(x => initial.indexOf(x) === -1)
    let exclude = initial.length > 0 && initial.filter(x => current.indexOf(x) === -1)
    let include_data = [], exclude_data = []

    include && include.length > 0 && include.forEach(e => {
        include_data.push({
            "hrid": e
        })
    })
    exclude && exclude.length > 0 && exclude.forEach(e => {
        exclude_data.push({
            "hrid": e
        })
    })
    const jsonData = {
        "action": "est_MP_TL1-ResourceManage",
        "details": {
            "est_MP_TL1_id": id,
            "inlcudeResource": include_data,
            "exlcudeResource": exclude_data
        }
    }

    try {
        const response = await http.post("/plan/projectResourceAllocate", jsonData)
        return (response.status == 200)
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const approveProject = async function (id) {
    let jsonData = {
        "prj_id": id,
        "action":"approved"
    }
    try {
        const response = await http.post("/plan/projectApprove", jsonData)
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

const addDoc = async function (id, code, description, file) {
    let jsonData = {
        "prj_id": id,
        "docTypeCode": code,
        "fileDescription": description,
        "projRelatedDoc": file
    }
    const postData = new FormData()
    postData.append('prj_id', id)
    postData.append('docTypeCode', code)
    postData.append('fileDescription', description)
    postData.append('projRelatedDoc', file, file.name)
    try {
        const response = await http.post("/plan/projectAddDoc", postData)
        if (response.status == 200) {
            const data = response.data;
            console.log("file uploaded", data)
            return data.success
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const deleteDoc = async function (id, doc_id, store_id) {
    let jsonData = {
        "prj_id": id,
        "projectDocsid": doc_id,
        "documentStoreid": store_id
    }
    try {
        const response = await http.post("/plan/projectRemoveDoc", jsonData)
        if (response.status == 200) {
            const data = response.data;
            console.log("doc deleted", data)
            return data.success
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const getDoc = async function (id, doc_id, store_id) {
    let jsonData = {
        "prj_id": id,
        "projectDocsid": doc_id,
        "documentStoreid": store_id
    }
    console.log("downl", jsonData)
    try {
        const response = await http.post("/plan/projectGetDoc", jsonData)
        return response
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const getMpEstimate = async function (phaseId, level, taskId) {
    let jsonData = {
        "phaseid": phaseId,
        "taskLevel_1_2_3_4": level,
        "est_MP_TLx_id": taskId
    }
    try {
        const response = await http.post("/plan/projectGetmpEstimate", jsonData)
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

const getStaff = async function (roleId, from, to) {
    let jsonData = {
        "required_roleid": roleId,
        "required_dateFrom": from,
        "required_dateTo": to
    }
    try {
        const response = await http.post("/plan/listOfSuitablePeople", jsonData)
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

const saveRoleData = async function (roleData, level) {
    let data = []
    roleData.forEach(e => {
        const e1 = Object.assign({}, e)
        e1.estimatedTimeInMinutes = e1.estimatedTimeInMinutes * 60
        data.push(e1)
    })
    console.log("before save data", data)
    let result
    if (level == 1) {
        result = await saveRoleDataL1(data)
    } else if (level == 2) {
        result = await saveRoleDataL2(data)
    } else if (level == 3) {
        result = await saveRoleDataL3(data)
    } else if (level == 4) {
        result = await saveRoleDataL4(data)
    }
    return result
}

const saveRoleDataL1 = async function (roleData) {
    let jsonData = {
        "est_MP_TL1_id": roleData[0].est_MP_TL1_id,
        "dataToSave": roleData
    }
    try {
        const response = await http.post("/plan/projectL1mpSave", jsonData)
        if (response.status == 200) {
            const data = response.data
            console.log("after save l1", data)
            return data.success
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const saveRoleDataL2 = async function (roleData) {
    let jsonData = {
        "est_MP_TL2_id": roleData[0].est_MP_TL2_id,
        "dataToSave": roleData
    }
    try {
        const response = await http.post("/plan/projectL2mpSave", jsonData)
        if (response.status == 200) {
            const data = response.data
            console.log("after save l2", data)
            return data.success
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const saveRoleDataL3 = async function (roleData) {
    let jsonData = {
        "est_MP_TL3_id": roleData[0].est_MP_TL3_id,
        "dataToSave": roleData
    }
    try {
        const response = await http.post("/plan/projectL3mpSave", jsonData)
        if (response.status == 200) {
            const data = response.data
            console.log("after save l3", data)
            return data.success
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const saveRoleDataL4 = async function (roleData) {
    let jsonData = {
        "est_MP_TL4_id": roleData[0].est_MP_TL4_id,
        "dataToSave": roleData
    }
    try {
        const response = await http.post("/plan/projectL4mpSave", jsonData)
        if (response.status == 200) {
            const data = response.data
            console.log("after save l4", data)
            return data.success
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const getProjectConfigValues = async function () {
    let jsonData = {
        "code":"projectRelated"
    }
    try {
        const response = await http.post("/common/getProjectConfigValues", jsonData)
        if (response.status == 200) {
            const data = response.data
            console.log("response", data.response)
            return data.response
        }
    }
    catch (error) {
        console.log(error)
    }
    return []
}

const projectResource = async function (taskLevel, taskId, roleId) {
    let jsonData = {
        "taskLevel_1_2_3_4": taskLevel,
        "est_MP_TLx_id": taskId,
        "roleid": roleId
    }
    try {
        const response = await http.post("/plan/projectResourceAllocateRoleWise", jsonData)
        if (response.status == 200) {
            const data = response.data
            if (data.success) {
                //group by date
                let result = []
                let days = []
                const ret = data.response.allCarrierRecord[0]
                ret && ret.length > 0 && ret.forEach(e => {
                    days.push(e.workingDate)
                });
                days = [...new Set(days)]
                days.forEach(e => {
                    const filtered = ret.filter(v => v.workingDate == e)
                    const temp = {
                        "workingDate": e,
                        "allocatedMinutes": 0,
                        "ids": [],
                        // "names": ""
                        "names": []
                    }
                    filtered.forEach( (f, i) => {
                        temp.allocatedMinutes = f.allocatedMinutes
                        temp.ids.push(f.hrid)
                        temp.names.push(f.firstname + ' ' + f.lastname)
                        // temp.names += (f.firstname + ' ' + f.lastname)
                        // i != (filtered.length - 1) && (temp.names +=  ', ')
                    })
                    result.push(temp)
                })
                console.log('resource result', data, result)
                return result
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return []
}

const getProjectManager = async function () {
    let jsonData = {
        "specificType":"role",
        "specificValue":"project manager"
    }
    try {
        const response = await http.post("/hr/hrFindSpecific", jsonData)
        if (response.status == 200) {
            const data = response.data
            console.log("response", data.response)
            return data.response.allCarrierRecord
        }
    }
    catch (error) {
        console.log(error)
    }
    return []
}

const getLastProject = async function () {
    try {
        const response = await http.post("/plan/findsLastProjectCodes")
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

const findPeople = async function () {
    let ret = await associate.findAll()
    let result = []
    ret && ret.length > 0 && ret.forEach(item => {
        result.push({
            id: item.id,
            name: item.firstname + " " + item.lastname
        })
    })    
    return result
}

const getProgress = async function (id, date) {
    let jsonData = {
        "phaseid": id,
        "uptoDate": date ? date : getCurrentDate()
    }
    console.log(jsonData)

    let result = []
    try {
        const response = await http.post("/reports/projectprogress001", jsonData)
        if (response.status == 200) {
            const data = response.data;
            if (data.success) {
                result = data.response.allCarrierRecord.id[0]
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return result
}

const getCurrentDate = function () {
    const date = new Date()
    return (1900 + date.getYear()) + '-' + (date.getMonth() + 1) + '-' + date.getDate()
}

export default {
    findAll,
    addProject,
    updateProject,
    updateTaskList,
    getTaskByLevel,
    getTaskByKeyInfo,
    setServerItem,
    phaseSet,
    saveTask1,
    saveTask2,
    saveTask3,
    saveTask4,
    projectCategory,
    getTask1,
    getTask2,
    getTask3,
    getTask4,
    getProjectCategory,
    addProjectCategory,
    removeProjectCategory,
    getProjectWithPhase,
    getProjects,
    getTree,
    saveTaskByLevel,
    checkRemoveTask1,
    checkRemoveTask2,
    checkRemoveTask3,
    checkRemoveTask4,
    checkRemoveTaskByLevel,
    checkRemoveCategory,
    allocateResource,
    findPeople,
    getProgress,
    approveProject,
    
    addDoc,
    deleteDoc,
    getDoc,

    getMpEstimate,
    getStaff,
    saveRoleData,
    projectResource,
    getProjectConfigValues,
    getProjectManager,
    getLastProject
}
