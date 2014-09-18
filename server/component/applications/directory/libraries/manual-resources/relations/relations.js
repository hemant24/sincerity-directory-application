document.executeOnce('/prudence/resources/')
document.executeOnce('/mongo-db/')
document.executeOnce('/sincerity/json/')
document.executeOnce('/sincerity/objects/')
document.executeOnce('/prudence/logging/')
document.executeOnce('/util/service/')


var Directory = Directory || {}


Directory.Relations = Directory.Relations || function(){
	var Public = {}
	var companyCollection = new MongoDB.Collection('company')
	var employeeCollection = new MongoDB.Collection('employee')
	var linkCollection = new MongoDB.Collection('link')

	Public.CompanyEmployeeLink = Sincerity.Classes.define(function(module) {
		var Public = {}

		var dictionary = {
	    	link : {
	        	employeeId : 'string',
	        	companyId : 'string'
	    	}
		}
		Public.handleInit = function(conversation) {
			    conversation.addMediaTypeByName('application/json')
			    conversation.addMediaTypeByName('application/xml')
			    conversation.addMediaTypeByName('text/plain')
			}
		Public.handlePost = function(conversation){
			try{
		        var linkForm =  Util.Service.getValidJson(conversation, dictionary)
				linkForm = linkForm.link
		        var employeeId = linkForm.employeeId
		        var companyId = linkForm.companyId

		        if(! employeeId){
					return Util.Service.convertError(conversation,'employee id cannot be null')
		        }
		        if(! companyId){
		        	return Util.Service.convertError(conversation,'employee id cannot be null')
		        }
		        var employee = employeeCollection.findOne({_id : MongoDB.id(employeeId)})
		        if(!employee){
		        	return Util.Service.convertError(conversation,'employee does not exists')
		        }

		        var company = companyCollection.findOne({_id : MongoDB.id(companyId)})
		        if(!company){
		        	return Util.Service.convertError(conversation,'company does not exists')
		        }

		        var existingLink = linkCollection.findOne({employeeId : employeeId , companyId : companyId })
		        if(existingLink){
		        	return Util.Service.convertError(conversation,'link already exists')
		        }else{
		        	linkCollection.save({employeeId : employeeId , companyId : companyId })
		        }
		    }catch(msg){
		        return Util.Service.convertError(conversation,msg)
		    }
		    return Util.Service.convert(conversation, {data : {status : 'success'}}, 'result', 'result')
		}

		Public.handleGet = function(conversation){
			var companyId = conversation.query.get('companyId')
			var employeeId = conversation.query.get('employeeId')
			var id = conversation.locals.get('id')
			var query = {}
			if(companyId){
				query['companyId'] = companyId
			}
			if(employeeId){
				query['employeeId'] = employeeId
			}
			if(id){
				query = {}
				query['_id'] = MongoDB.id(id)
			}
			var links = linkCollection.find(query).toArray()
			return Util.Service.convert(conversation, {data : links}, 'links', 'link')

		}
		Public.handleDelete = function(conversation){
			var linkId = conversation.locals.get('id')
		    try{
		        var existingLink = linkCollection.findOne({_id : MongoDB.id(linkId)})
		        if(!existingLink){
		            return Util.Service.convertError(conversation,'link does not exists')
		        }
		        linkCollection.remove(existingLink)
		        return Util.Service.convert(conversation, {data : {status : 'success'}}, 'result', 'result')
		    }catch(msg){
		        return Util.Service.convertError(conversation,msg)
		    }
		}

		return Public

	}(Public))

	return Public

}()