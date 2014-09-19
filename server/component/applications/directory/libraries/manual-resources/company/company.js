document.executeOnce('/prudence/resources/')
document.executeOnce('/mongo-db/')
document.executeOnce('/sincerity/json/')
document.executeOnce('/sincerity/objects/')
document.executeOnce('/prudence/logging/')
document.executeOnce('/util/service/')

var Directory = Directory || {}



Directory.Company = Directory.Company || Sincerity.Classes.define(function() {

	var companyCollection = new MongoDB.Collection('company')

	var dictionary = {
	    company : {
	        name : 'string',
	        location : 'string',
	        doe : 'string',
	        indusType : 'string'
	    }
	}

	var Public = {}

	Public.logger = Prudence.Logging.getLogger('company')



	Public.handleInit = function(conversation) {
	    conversation.addMediaTypeByName('application/json')
	    conversation.addMediaTypeByName('application/xml')
	    conversation.addMediaTypeByName('text/plain')
	}

	Public.handlePost = function(conversation){
	    try{
	        var company =  Util.Service.getValidJson(conversation, dictionary)
	        company = company.company
	        if(! company.name){
				return Util.Service.convertError(conversation,'company name cannot be null')
	        }
	        companyCollection.save(company)
	    }catch(msg){
	        return Util.Service.convertError(conversation,msg)
	    }
	    return Util.Service.convert(conversation, {data : company}, 'companies', 'company')
	}


	Public.handlePut = function(conversation){
	    var companyId = conversation.locals.get('id')
	    try{
	        var existingcompany = companyCollection.findOne({_id : MongoDB.id(companyId)})
	        if(!existingcompany){
	            return Util.Service.convertError(conversation,'company does not exists')
	        }
	       
	        var companyForm =  Util.Service.getValidJsonForUpdate(conversation, dictionary)
	        companyForm = companyForm.company

	        Util.Service.mergeRecursive(existingcompany, companyForm)
	        if(! existingcompany.name){
				return Util.Service.convertError(conversation,'company name cannot be null')
	        }
	        companyCollection.save(existingcompany)
	        return Util.Service.convert(conversation, {data : existingcompany}, 'companies', 'company')
	    }catch(msg){
	        return Util.Service.convertError(conversation,msg)
	    }
	}

	Public.handleDelete = function(conversation){
	    var companyId = conversation.locals.get('id')
	    try{
	        var existingcompany = companyCollection.findOne({_id : MongoDB.id(companyId)})
	        if(!existingcompany){
	            return Util.Service.convertError(conversation,'company does not exists')
	        }
	        companyCollection.remove(existingcompany)
	        return Util.Service.convert(conversation, {data : {status : 'success'}}, 'result', 'result')
	    }catch(msg){
	        return Util.Service.convertError(conversation,msg)
	    }
	}

	Public.handleGet = function(conversation){
		var companyId = conversation.locals.get('id')
		var query = {}
		var result = {}
		if(companyId){
			query['_id'] = MongoDB.id(companyId)
			var company = companyCollection.findOne(query)
			result['data'] = company
		}else{
			var companyList = companyCollection.find(query).toArray()
			result['data'] = companyList
		}
        return Util.Service.convert(conversation, result, 'companies', 'company')
    }

    return Public

}())