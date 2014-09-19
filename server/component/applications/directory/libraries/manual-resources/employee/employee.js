document.executeOnce('/prudence/resources/')
document.executeOnce('/mongo-db/')
document.executeOnce('/sincerity/json/')
document.executeOnce('/sincerity/objects/')
document.executeOnce('/prudence/logging/')
document.executeOnce('/util/service/')

var Directory = Directory || {}



Directory.Employee = Directory.Employee || Sincerity.Classes.define(function() {

	var employeeCollection = new MongoDB.Collection('employee')

	var dictionary = {
	    employee : {
	        name : 'string',
	        age : 'int',
	        gender : 'string',
	        designation : 'string'
	    }
	}

	var Public = {}

	Public.logger = Prudence.Logging.getLogger('Employee')



	Public.handleInit = function(conversation) {
	    conversation.addMediaTypeByName('application/json')
	    conversation.addMediaTypeByName('application/xml')
	    conversation.addMediaTypeByName('text/plain')
	}

	Public.handlePost = function(conversation){
	    try{
	        var employee =  Util.Service.getValidJson(conversation, dictionary)
	        employee = employee.employee
	        if(! employee.name){
				return Util.Service.convertError(conversation,'employee name cannot be null')
	        }
	        employeeCollection.save(employee)
	    }catch(msg){
	        return Util.Service.convertError(conversation,msg)
	    }
	    return Util.Service.convert(conversation, {data : employee}, 'employee', 'employee')
	}


	Public.handlePut = function(conversation){
	    var employeeId = conversation.locals.get('id')
	    try{
	        var existingEmployee = employeeCollection.findOne({_id : MongoDB.id(employeeId)})
	        if(!existingEmployee){
	            return Util.Service.convertError(conversation,'employee does not exists')
	        }
	       
	        var employeeForm =  Util.Service.getValidJsonForUpdate(conversation, dictionary)
	        employeeForm = employeeForm.employee

	        Util.Service.mergeRecursive(existingEmployee, employeeForm)
	        if(! existingEmployee.name){
				return Util.Service.convertError(conversation,'employee name cannot be null')
	        }
	        employeeCollection.save(existingEmployee)
	        return Util.Service.convert(conversation, {data : existingEmployee}, 'employee', 'employee')
	    }catch(msg){
	        return Util.Service.convertError(conversation,msg)
	    }
	}

	Public.handleDelete = function(conversation){
	    var employeeId = conversation.locals.get('id')
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

	Public.handleGet = function(conversation){
		var employeeId = conversation.locals.get('id')
		var query = {}
		var result = {}
		if(employeeId){
			query['_id'] = MongoDB.id(employeeId)
			var employee = employeeCollection.findOne(query)
			result['data'] = employee
		}else{
			var employeeList = employeeCollection.find(query).toArray()
			result['data'] = employeeList
		}
        return Util.Service.convert(conversation, result, 'employees', 'employee')
    }

    return Public

}())