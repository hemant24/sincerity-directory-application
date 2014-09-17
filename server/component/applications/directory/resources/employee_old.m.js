document.executeOnce('/prudence/resources/')
document.executeOnce('/mongo-db/')
document.executeOnce('/sincerity/json/')
document.executeOnce('/util/service/')

/**
 *  * 
 *   * @author Hemant Sachdeva
 *    * @version 1.0
 *     */

var employeeCollection = new MongoDB.Collection('employee')
var dictionary = {
    employee : {
        name : 'string',
        age : 'int',
        sex : 'string'
    }
}

function handleInit(conversation) {
    conversation.addMediaTypeByName('application/json')
    conversation.addMediaTypeByName('application/xml')
    conversation.addMediaTypeByName('text/plain')
}

function handlePost(conversation){
    try{
        var employee =  Util.Service.getValidJson(conversation, dictionary)
        employeeCollection.save(employee)
    }catch(msg){
        return Util.Service.convertError(conversation,msg)
    }
    return Util.Service.convert(conversation, {data : employee}, 'employee', 'employee')
}
function handlePut(conversation){
    var employeeId = conversation.query.get('id')
    try{
        var existingEmployee = employeeCollection.findOne({_id : MongoDB.id(employeeId)})
        if(!existingEmployee){
            return Util.Service.convertError(conversation,'employee does not exists')
        }
       
        var employeeForm =  Util.Service.getValidJsonForUpdate(conversation, dictionary)
        Util.Service.mergeRecursive(existingEmployee, employeeForm)
        employeeCollection.save(existingEmployee)
        return Util.Service.convert(conversation, {data : existingEmployee}, 'employee', 'employee')
    }catch(msg){
        return Util.Service.convertError(conversation,msg)
    }
}

function handleDelete(conversation){
    var employeeId = conversation.query.get('id')
    try{
        var existingEmployee = employeeCollection.findOne({_id : MongoDB.id(employeeId)})
        if(!existingEmployee){
            return Util.Service.convertError(conversation,'employee does not exists')
        }
        employeeCollection.remove(existingEmployee)
        return Util.Service.convert(conversation, {data : {status : 'success'}}, 'result', 'result')
    }catch(msg){
        return Util.Service.convertError(conversation,msg)
    }
}

function handleGet(conversation){
        var employeeList = employeeCollection.find().toArray()
        return Util.Service.convert(conversation, {data : employeeList}, 'employees', 'employee')
    }


