document.executeOnce('/prudence/resources/')
document.executeOnce('/mongo-db/')
document.executeOnce('/sincerity/json/')
document.executeOnce('/sincerity/objects/')
document.executeOnce('/prudence/logging/')
document.executeOnce('/util/service/')

var Directory = Directory || {}


Directory.Comments = Directory.Comments || function(){
	var Public = {}
	var dictionary = {
		    comment : {
		        text : 'string'
		    }
		}
	var commentCollection = new MongoDB.Collection('comment')
	var employeeCollection = new MongoDB.Collection('employee')
	var companyCollection = new MongoDB.Collection('company')

	Public.addComments = function(entityCollection, conversation){
		try{
		    	var entityId = conversation.locals.get('id')
		    	var entity = entityCollection.findOne({_id : MongoDB.id(entityId)})
		    	if(!entity){
		    		return Util.Service.convertError(conversation,'Invalid entity')
		    	}
		        var comment =  Util.Service.getValidJson(conversation, dictionary)
		        comment = comment.comment
		        if(!comment){
		        	return Util.Service.convertError(conversation,'comment cannot be empty')
		        }
		        if(!comment.text){
		        	return Util.Service.convertError(conversation,'comment cannot be empty')
		        }
		        comment.entity_id = entityId
		        commentCollection.save(comment)
		        delete comment.entity_id
		    }catch(msg){
		        return Util.Service.convertError(conversation,msg)
		    }
		    return Util.Service.convert(conversation, {data : comment}, 'comments', 'comment')
	}

	Public.getCommentList = function(entityCollection, conversation){
			var entityId = conversation.locals.get('id')
			var entity = entityCollection.findOne({_id : MongoDB.id(entityId)})
	    	if(!entity){
	    		return Util.Service.convertError(conversation,'Invalid entity')
	    	}
			var query = {entity_id : entityId}
			var result = {}
			var commentList = commentCollection.find(query).toArray()
			for(var i in commentList){
				delete commentList[i].entity_id
			}
			result['data'] = commentList
	        return Util.Service.convert(conversation, result, 'comments', 'comment')
	}


	Public.Company = Sincerity.Classes.define(function(Module) {
		

		var Public = {}

		Public.logger = Prudence.Logging.getLogger('comment')



		Public.handleInit = function(conversation) {
		    conversation.addMediaTypeByName('application/json')
		    conversation.addMediaTypeByName('application/xml')
		    conversation.addMediaTypeByName('text/plain')
		}

		Public.handlePost = function(conversation){
		    return Module.addComments(companyCollection, conversation)
		}


		Public.handleGet = function(conversation){
			return Module.getCommentList(companyCollection, conversation)
	    }

	    return Public

	}(Public))


	Public.Employee = Sincerity.Classes.define(function(Module) {
	

	var Public = {}

	Public.logger = Prudence.Logging.getLogger('comment')



	Public.handleInit = function(conversation) {
	    conversation.addMediaTypeByName('application/json')
	    conversation.addMediaTypeByName('application/xml')
	    conversation.addMediaTypeByName('text/plain')
	}

	Public.handlePost = function(conversation){
	    return Module.addComments(employeeCollection, conversation)
	}


	Public.handleGet = function(conversation){
		return Module.getCommentList(employeeCollection, conversation)
    }

    return Public

	}(Public))


	return Public

}()