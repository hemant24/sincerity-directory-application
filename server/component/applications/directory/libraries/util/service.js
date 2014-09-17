var Util = Util || {}

Util.Service = Util.Service || function() {

    var Public = {}
    var INVALIDTYPEERRORMSG = '{parameter} should be {type}'
    var convertShortTypeNameToFullTypeName = function(shortTypeName){
        switch(shortTypeName) {
            case 'int':
                return 'integer'
                break
            default : 
                return shortTypeName
        }
    }

	Public.convertToType = function(type , value) {
	        var result
	        switch(type) {
	            case 'string' :
	                result = Sincerity.Objects.exists(value) ? String(value) : null 
	                break
	            case 'int':
	                if (isNaN(value)) {
	                    result = null
	                }else{
	                    result = parseInt(value)
	                    if(isNaN(result)){
	                        result = null
	                    }
	                }
	                break
	            case 'float':
	                if (isNaN(value)) {
	                    result = null
	                }else{
	                    result = parseFloat(value)
	                    if(isNaN(result)){
	                        result = null
	                    }
	                }
	                break
	            case 'bool':
	                if (value == 'true' || value == true) {
	                    result = true
	                } else if (value == 'false' || value == false) {
	                        result = false
	                } else {
	                        result = null
	                }
	                break
	             default : 
	                result =  Sincerity.Objects.exists(value) ? String(value) : null 
	                break
	        }
	        return result
	    }

	Public.createObjectFromSchema = function(schema, payload , parent, errorObject) {
        for (var p in schema) {
          try {
              if(Sincerity.Objects.isArray(schema[p])) {
                  if(payload == null || !Sincerity.Objects.isArray(payload[p])) {
                      if(!Sincerity.Objects.isObject(schema[p][0])) {
                          schema[p] = []
                      }else{
                          schema[p] = []
                          /* Disable it for now causing issue at validation side 
                          var schemaObject = schema[p][0]
                          schema[p] = []
                          var schmaObjectCopy = Sincerity.Objects.clone(schemaObject)
                          schema[p].push(Public.createObjectFromSchema(schmaObjectCopy, null))
                          */
                      }
                  }else{
                      if(payload[p].length ) {
                          if(!Sincerity.Objects.isObject(schema[p][0]) && !Sincerity.Objects.isObject(payload[p][0])) {
                              var type = schema[p][0]
                              schema[p] = []
                              for( var i in payload[p]) {
                                  //Public.logger.info("processing 2: " + parent + '.' + payload[p][i])
                                  if(typeof payload[p][i] == 'string' && payload[p][i].trim() == ''){
                                    //payload[p][i] = null
                                      payload[p][i] = '' //Will handle later as worker is raising exception
                                  }
                                  var convertedValue = Public.convertToType(type , payload[p][i])
                                  if(payload[p][i] != null && convertedValue == null && Sincerity.Objects.exists(errorObject)){
                                      errorObject[parent + '.' + p] = INVALIDTYPEERRORMSG.cast({parameter : parent + '.' + p, type : convertShortTypeNameToFullTypeName(type)})
                                  }
                                  schema[p].push(convertedValue)
                                  /*
                                  switch(type) {
                                      case 'string' :
                                          schema[p].push( Sincerity.Objects.exists(payload[p][i]) ? String(payload[p][i]) : null )
                                          break
                                       default : 
                                          schema[p].push( Sincerity.Objects.exists(payload[p][i]) ? String(payload[p][i]) : null )
                                           break
                                  }*/
                              }
                          }else if(Sincerity.Objects.isObject(schema[p][0]) && (Sincerity.Objects.isObject(payload[p][0]) || !Sincerity.Objects.isObject(payload[p][0])) ) {
                              var schemaObject = schema[p][0]
                              schema[p] = []
                              for( var i in payload[p]) {
                                  var schmaObjectCopy = Sincerity.Objects.clone(schemaObject)
                                  schema[p].push(Public.createObjectFromSchema(schmaObjectCopy, payload[p][i], parent ? parent + '.' + p : p, errorObject))
                              }
                          }
                      }else{
                          if(!Sincerity.Objects.isObject(schema[p][0])) {
                              schema[p] = []
                          }else{
                              //schema[p] = Public.createObjectFromSchema(schema[p][0], null)
                              schema[p] = []
                          }
                      }
                  }
                  //Public.logger.info('yes '+ p + ' is array')
              }else{
                  if(payload == null && Sincerity.Objects.isObject(schema[p])) {
                      schema[p] = Public.createObjectFromSchema(schema[p], payload, parent ? parent + '.' + p : p, errorObject)
                  }else if(payload == null && !Sincerity.Objects.isObject(schema[p])) {
                      schema[p] = null
                  }else if( Sincerity.Objects.isObject(payload[p]) && Sincerity.Objects.isObject(schema[p])) {
                      schema[p] = Public.createObjectFromSchema(schema[p], payload[p], parent ? parent + '.' + p : p, errorObject)
                    } else if( Sincerity.Objects.isObject(payload[p]) && !Sincerity.Objects.isObject(schema[p]) ) {
                        schema[p] = null
                    }else if(!Sincerity.Objects.isObject(payload[p]) && Sincerity.Objects.isObject(schema[p]) ) {
                        schema[p] = Public.createObjectFromSchema(schema[p], payload[p], parent ? parent + '.' + p : p, errorObject)
                    }else {
                        //Public.logger.info("processing : " + parent + '.' + p) 
                        //Public.logger.info(p + " goint to convert as " + schema[p] + " current type is   " + typeof payload[p])
                        if(typeof payload[p] == 'string' && payload[p].trim() == ''){
                            //payload[p] = null
                              payload[p] = '' //Will handle later as worker is raising exception
                        }
                        var convertedValue = Public.convertToType(schema[p] , payload[p])
                        if(payload[p] != null && convertedValue == null && Sincerity.Objects.exists(errorObject)){
                            errorObject[parent + '.' + p] = INVALIDTYPEERRORMSG.cast({parameter : parent + '.' + p, type : convertShortTypeNameToFullTypeName(schema[p])})
                        }
                        schema[p] = convertedValue
                          /*switch(schema[p]) {
                              case 'string' :
                                  schema[p] = Sincerity.Objects.exists(payload[p]) ? String(payload[p]) : null
                                  break
                               default : 
                                   schema[p] = Sincerity.Objects.exists(payload[p]) ? String(payload[p]) : null
                                   break
                               
                          }*/
                    }
              }
          } catch(e) {
              Public.logger.info('Error while reflecting the request object')
              Public.logger.info(Sincerity.JSON.to(e))
          }
        }

        return schema;
      }

    Public.createObjectFromSchemaForUpdate = function(schema, payload, parent, errorObject) {
        for (var p in payload) {
            try {
              
              if(schema.hasOwnProperty(p)) {
                  if(Sincerity.Objects.isArray(schema[p])) {
                      if(!Sincerity.Objects.isArray(payload[p])) {
                          delete payload[p]
                      }else{
                          if(payload[p].length ) {
                              if(!Sincerity.Objects.isObject(schema[p][0]) && !Sincerity.Objects.isObject(payload[p][0])) {
                                  var type = schema[p][0]
                                  for( var i in payload[p]) {
                                      if(typeof payload[p][i] == 'string' && payload[p][i].trim() == ''){
                                          //payload[p][i] = null
                                          payload[p][i] = '' //Will handle later as worker is raising exception
                                      }
                                      var convertedValue = Public.convertToType(type, payload[p][i])
                                      if(payload[p][i] != null && convertedValue == null && Sincerity.Objects.exists(errorObject)){
                                          errorObject[parent + '.' + p] = INVALIDTYPEERRORMSG.cast({parameter : parent + '.' + p, type : convertShortTypeNameToFullTypeName(type)})
                                      }
                                      payload[p][i] = convertedValue
                                      /*switch(type) {
                                          case 'string' :
                                              payload[p][i] =  Sincerity.Objects.exists(payload[p][i]) ? String(payload[p][i]) : null 
                                              break
                                           default : 
                                              payload[p][i] =  Sincerity.Objects.exists(payload[p][i]) ? String(payload[p][i]) : null 
                                              break
                                      }*/
                                  }
                              }else if(Sincerity.Objects.isObject(schema[p][0]) && Sincerity.Objects.isObject(payload[p][0]) ) {
                                  var schemaObject = schema[p][0]
                                  schema[p] = []
                                  for( var i in payload[p]) {
                                      payload[p][i] = Public.createObjectFromSchemaForUpdate(schemaObject, payload[p][i] , parent ? parent + '.' + p : p, errorObject)
                                  }
                              }else if(Sincerity.Objects.isObject(schema[p][0]) && !Sincerity.Objects.isObject(payload[p][0]) ) {
                                  payload[p]  = []
                              }
                          }
                      }
                  }else{
                      if ( Sincerity.Objects.isObject(payload[p]) && Sincerity.Objects.isObject(schema[p])) {
                        schema[p] = Public.createObjectFromSchemaForUpdate(schema[p], payload[p], parent ? parent + '.' + p : p, errorObject); //Really assigned to schema ??
                      } else if( (Sincerity.Objects.isObject(payload[p]) && !Sincerity.Objects.isObject(schema[p]) ) || (!Sincerity.Objects.isObject(payload[p]) && Sincerity.Objects.isObject(schema[p]) ) ) {
                          delete payload[p]
                      }else {
                          if(typeof payload[p] == 'string' && payload[p].trim() == ''){
                              //payload[p] = null
                              payload[p] = '' //Will handle later as worker is raising exception
                          }
                          var convertedValue = Public.convertToType(schema[p] , payload[p])
                          if(payload[p] != null && convertedValue == null && Sincerity.Objects.exists(errorObject)){
                              errorObject[parent + '.' + p] = INVALIDTYPEERRORMSG.cast({parameter : parent + '.' + p, type : convertShortTypeNameToFullTypeName(schema[p])})
                          }
                          
                          payload[p] = convertedValue
                          /*
                          switch(schema[p]) {
                              case 'string' :
                                  payload[p] = Sincerity.Objects.exists(payload[p]) ? String(payload[p]) : null
                                  break
                               default : 
                                   payload[p] = Sincerity.Objects.exists(payload[p]) ? String(payload[p]) : null
                                   break
                          }*/
                      }
                  }
              }else{
                  delete payload[p]
              }
            } catch(e) {
                Public.logger.info('Error while reflecting the request object')
                Public.logger.info(Sincerity.JSON.to(e))
            }
          }
          return payload;
        }

    Public.getValidJson = function(conversation, schema) {
        var rawJson = {}
        var text = conversation.entity.text
        if(text != null) {
            try{
                rawJson = Sincerity.JSON.from(text)
            }catch(e) {
                throw 'invalid json'
                
            }
        }
        var resultJson = Sincerity.Objects.clone(schema)
        var errorObject = {}
        Public.createObjectFromSchema(resultJson, rawJson, null, errorObject);
        

        return resultJson
    }

	Public.getValidJsonForUpdate = function(conversation, schema) {
        var rawJson = {}
        var text = conversation.entity.text
        if(text != null) {
            try{
                rawJson = Sincerity.JSON.from(text)
            }catch(e) {
                throw 'invalid json'
                
            }
        }
        var resultJson = Sincerity.Objects.clone(schema)
        var errorObject = {}
        Public.createObjectFromSchemaForUpdate(resultJson, rawJson, null, errorObject);
        
        return rawJson
    }
    Public.cleanSingleMongoData = function(json) {
        if(Sincerity.Objects.exists(json)) {
            if(Sincerity.Objects.exists(json._id)) {
                json.id = String(json._id)
                delete json._id
            }
            for( var i in json) {
                if(Sincerity.Objects.isDate(json[i])) {
                    json[i] = json[i].getTime()
                }
            }
        }
    }
    Public.cleanMongoData = function(json) {
        if(Sincerity.Objects.exists(json)) {
            if (Sincerity.Objects.isArray(json.data)) {
                for( var k in json.data) {
                    Public.cleanSingleMongoData.call(this, json.data[k])
                }
            }else{
                Public.cleanSingleMongoData.call(this, json.data)
            }
        }
    }
    Public.mergeRecursive = function(to, from) {
        for (var p in from) {
            try {
                if(from.hasOwnProperty(p)){
                    if (Sincerity.Objects.isObject(from[p]) && Sincerity.Objects.isObject(to[p])) {
                        if(Sincerity.Objects.isDate(from[p]) && Sincerity.Objects.isDate(to[p])){
                            to[p] = from[p]
                        }else{
                            to[p] = Public.mergeRecursive(to[p], from[p]);
                        }
                      } else {
                        to[p] = from[p]
                      }
                }
            } catch(e) {
                Public.logger.info('Target object does not have '+ p +' property. So creating new property in target object')
                to[p] = {}
                to[p] = from[p]
            }
          }
          return to;
    }
	Public.convert = function(conversation, result, rootName, subRootName) {
        Public.cleanMongoData.call(this, result)
        rootName = rootName || 'data'
        subRootName = subRootName || 'result'
        var jsonData = {}
        if (Sincerity.Objects.isArray(result.data)) {
            jsonData[rootName] = result.data
        } else {
            jsonData[subRootName] = result.data
        }
        for (v in result.meta) {
            jsonData[v] = result.meta[v]
        }

        var xmlData = {}

        if (Sincerity.Objects.isArray(result.data)) {
            xmlData[rootName] = {}
            xmlData[rootName][subRootName] = result.data
        } else {
            xmlData[subRootName] = result.data
        }

        var queryParams = Prudence.Resources.getQuery(conversation, {
            human : 'bool',
            format : 'string',
            jsonp: 'string'
        })
        queryParams.human = Sincerity.Objects.ensure(queryParams.human, false)
        if (Sincerity.Objects.exists(queryParams.format)) {
            switch (queryParams.format) {
            case 'json':
                conversation.mediaTypeName = 'application/json'
                break
            case 'xml':
                conversation.mediaTypeName = 'application/xml'
                break
            case 'jsonp':
                conversation.mediaTypeName = 'application/javascript'
                break
            default:
                // Unsupported format
                return 400
            }
        }
        conversation.mediaTypeName = 'application/json'
        switch (Sincerity.Objects.string(conversation.mediaTypeName)) {
        case 'application/javascript':
            if (!Sincerity.Objects.exists(queryParams.jsonp) || (queryParams.jsonp.length == 0)) {
                return Prudence.Resources.Status.ClientError.BadRequest
            }
            return queryParams.jsonp + '(' + Sincerity.JSON.to(jsonData) + ')'
        case 'application/xml':
            var xmlDOM = Sincerity.XML.from(Sincerity.XML.to(xmlData))
            for (v in result.meta) {
                xmlDOM.node.getDocumentElement().setAttribute(v, result.meta[v])
            }
            // return Sincerity.XML.to(xmlData ,queryParams.human)
            return xmlDOM.toXml()

            return Sincerity.XML.to(xmlData, queryParams.human)
        case 'application/json':
        case 'text/plain':
            return Sincerity.JSON.to(jsonData, queryParams.human)
        case 'application/internal':
            if (!conversation.internal) {
                // Only internal clients should be requesting this media type!
                return 400
            }
            return jsonData
        
        default:
            return 500
            break
        }
    }

     Public.convertError = function(conversation, errorMessage) {

        var queryParams = Prudence.Resources.getQuery(conversation, {
            human : 'bool',
            format : 'string',
            suppress_response_codes : 'bool'
        })
        queryParams.human = Sincerity.Objects.ensure(queryParams.human, false)
        queryParams.suppress_response_codes = Sincerity.Objects.ensure(queryParams.suppress_response_codes, false)
        if (!queryParams.suppress_response_codes) {
            conversation.setStatus(org.restlet.data.Status.SERVER_ERROR_INTERNAL)
            conversation.response.attributes.put('com.threecrickets.prudence.DelegatedStatusService.passThrough', true)
        } else {
            conversation.response.attributes.put('com.threecrickets.prudence.DelegatedStatusService.passThrough', false)
        }
        if (Sincerity.Objects.exists(queryParams.format)) {
            switch (queryParams.format) {
            case 'json':
                conversation.mediaTypeName = 'application/json'
                break
            case 'xml':
                conversation.mediaTypeName = 'application/xml'
                break
            default:
                conversation.mediaTypeName = 'application/json'
                break
            }
        }

        var response = {
            error : {
                error_message : errorMessage
            }
        }
       
        conversation.mediaTypeName = 'application/json'
        switch (Sincerity.Objects.string(conversation.mediaTypeName)) {
        case 'application/xml':
            var xmlData = {}
            xmlData = response
            return Sincerity.XML.to(xmlData, queryParams.human)
        case 'application/json':
        case 'text/plain':
            return Sincerity.JSON.to(response, queryParams.human)
        case 'application/internal':
            if (!conversation.internal) {
                return 400
            }
            return response
        default:
            return Sincerity.JSON.to(response, queryParams.human)
            break
        }

    }

        return Public
}()
