define([
	"jquery",
	"qlik",	
    "qvangular"
],
function ( jQuery, qlik, qvangular ) {
	'use strict';
	qvangular.service('masterItemService', [function(){
		
        this.getData = function(){
            var deferred = $.Deferred();
            var app = qlik.currApp(this),
				dimensionList,
                measureList,
                objectDestroyId=[],                
                destroyObject = function(objectId){
                    var deferred = $.Deferred(),
                        destroyedConfirmation=[];
                    $.each(objectId, function(kye, id){
                        app.destroySessionObject(id)
                        .then(function(a){
                            destroyedConfirmation.push({id:id,message:a});
                        });
                    });
                    if(destroyedConfirmation.length == objectId.length){
                        deferred.resolve(destroyedConfirmation);
                    }
                    return deferred;
                },
				// settings up the createGenericObject call for the qMeasureListDef
				measureCall = {
					qInfo: {
					qId:"measureObjectExt",	
					qType: "MeasureListExt"
					},
					qMeasureListDef: {
					qType: "measure",
					qData: {
						title: "/qMetaDef/title",
						tags: "/qMetaDef/tags",
						expression: "/qMeasure/qDef",
						description: "/qMetaDef/description"
						}
					}
				},
				// settings up the createGenericObject call for the qDimensionListDef
				dimensionCall = {
					qInfo: {
					qId:"DimensionObjectExt",
					qType: "DimensionListExt"
					},
					qDimensionListDef: {
					qType: "dimension",
					qData: {
						grouping: "/qDim/qGrouping",
						info: "/qDimInfos",
						title: "/qMetaDef/title",
						tags: "/qMetaDef/tags",
						expression: "/qDim",
						description: "/qMetaDef/description"
						}
					}
				},
                getMasterObjects = function(type) {
                    var deferred = $.Deferred();
                    type == 1 ? 
                        app.createGenericObject(
                            measureCall, function(reply) {
                                var measureReply;
                                objectDestroyId.push(reply.qInfo.qId);
                                measureReply = reply.qMeasureList.qItems;
                                deferred.resolve(measureReply);
                        }) : 
                        app.createGenericObject(
                            dimensionCall, function(reply) {
                                var dimensionReply;
                                objectDestroyId.push(reply.qInfo.qId);
                                dimensionReply = reply.qDimensionList.qItems;
                                deferred.resolve(dimensionReply);
                        });					
					return deferred;
                };
                getMasterObjects(1).done(function(measures){
                    measureList = measures;                    
                }).done(getMasterObjects(0).done(function(dimensions){
                        dimensionList = dimensions;
                    }).done(function(){
                        var qMasterMeasures = {dimensions:dimensionList,measures:measureList},
                            destroy = destroyObject(objectDestroyId);
                        deferred.resolve(qMasterMeasures);
                    })
                );
            return deferred;
        };
    }]);
});