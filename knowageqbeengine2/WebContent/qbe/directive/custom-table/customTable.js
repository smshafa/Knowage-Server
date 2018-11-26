/**
 * Knowage, Open Source Business Intelligence suite
 * Copyright (C) 2016 Engineering Ingegneria Informatica S.p.A.
 * 
 * Knowage is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Knowage is distributed in the hope that it will be useful, 
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
(function() {
	var scripts = document.getElementsByTagName("script");
	var currentScriptPath = scripts[scripts.length - 1].src;
	currentScriptPath = currentScriptPath.substring(0, currentScriptPath.lastIndexOf('/') + 1);

angular.module('qbe_custom_table', ['ngDraggable'])
.directive('qbeCustomTable', function() {
    return {
        restrict: 'E',
        controller: qbeCustomTable,
        scope: {
            ngModel: '=',
            expression: '=',
            filters: '='
        },
        templateUrl: currentScriptPath + 'custom-table.html',
        replace: true,
        transclude:true,
        link: function link(scope, element, attrs) {
        }
    };
})
.filter("orderedById",function(){
    return function(input,idIndex) {
        var ordered = [];
		for (var key in idIndex) {
			for(var obj in input){
				if(idIndex[key]==input[obj].id){
					ordered.push(input[obj]);
				}
			}
			
		}
        return ordered;
    };
});
function qbeCustomTable($scope, $rootScope, $mdDialog, sbiModule_translate, sbiModule_config, $mdPanel, query_service, $q){
	
	$scope.smartPreview = true;
	
	$scope.completeResult = false;
	
	$scope.completeResultsColumns = [];
	
	$scope.previewModel = [];
	
	$scope.start = 0;
	
	$scope.itemsPerPage = 25;
	
	$scope.firstExecution = true;
	
	$scope.$watch('smartPreview',function(newValue,oldValue){
		query_service.setSmartView(newValue);
		$rootScope.$emit('smartView', $scope.ngModel);
	},true)
	
	$scope.translate = sbiModule_translate;
	
	$scope.selectedVisualization = 'previewData';
	
	$scope.orderAsc = true;

	$scope.openMenu = function($mdOpenMenu, ev) {
		originatorEv = ev;
		$mdOpenMenu(ev);
	};
	$scope.aggFunctions = [ "NONE", "SUM", "MIN", "MAX", "AVG", "COUNT", "COUNT_DISTINCT" ];

	$scope.moveRight = function(currentOrder, column) {

		var newOrder = currentOrder + 1;
		var index = $scope.ngModel.indexOf(column);
		var indexOfNext = index + 1;
		
		if(index!=undefined && indexOfNext!=-1 && newOrder <= $scope.ngModel.length){
			$scope.ngModel[index] = $scope.ngModel[indexOfNext];
			$scope.ngModel[index].order = currentOrder;

			$scope.ngModel[indexOfNext] = column;
			$scope.ngModel[indexOfNext].order = newOrder;
		}
		
	};

	$scope.moveLeft = function(currentOrder, column) {

		var newOrder = currentOrder - 1;
		var index = $scope.ngModel.indexOf(column);
		var indexOfBefore = index - 1;
		
		if(index!=undefined && indexOfBefore!=undefined && indexOfBefore!=-1){
			
			$scope.ngModel[index] = $scope.ngModel[indexOfBefore];
			$scope.ngModel[index].order = currentOrder;
			
			$scope.ngModel[indexOfBefore] = column;
			$scope.ngModel[indexOfBefore].order = newOrder;
		}

	};

	$scope.applyFuntion = function(funct, id, entity) {
		$rootScope.$emit('applyFunction', {
			"funct" : funct,
			"fieldId" : id,
			"entity" : entity
		});
	};
	
	$scope.group = function(id, entity, group) {
		$rootScope.$emit('group', {
			"fieldId" : id,
			"entity" : entity,
			"group" : !group
		});
	};
	
	$scope.setVisible = function (id, entity, visible) {
		for (var i = 0; i < $scope.ngModel.length; i++) {
			if($scope.ngModel[i].id==id){
				$scope.ngModel[i].visible = !visible;
			}
		}
		$rootScope.$broadcast('setVisible',{
			"fieldId" : id,
			"entity" : entity,
			"visible" : !visible
		});
	}
	
	$scope.removeColumn = function(field) {
		$rootScope.$emit('removeColumn', {
			"id" : field.id,
			"entity" : field.entity
		});
	};
	
	$scope.toggleOrder = function (data, reverse) {
		var ordered = [];
		if($scope.orderAsc) {
			ordered = data.sort(function(a,b) {return (a.value > b.value) ? 1 : ((b.value > a.value) ? -1 : 0);} );
			$scope.orderAsc = !$scope.orderAsc;
		} else {			
			ordered = data.sort(function(a,b) {return (a.value < b.value) ? 1 : ((b.value < a.value) ? -1 : 0);} );
			$scope.orderAsc = !$scope.orderAsc;
		}		
		$scope.idIndex = [];
		for(var itemIndex in ordered) {
			$scope.idIndex.push(ordered[itemIndex].id);
		}
	}
	
	$scope.openFiltersAdvanced = function (){
		$rootScope.$broadcast('openFiltersAdvanced', true);
	}
	
	$scope.executeRequest = function () {
		$scope.firstExecution = true;
		$rootScope.$broadcast('executeQuery', {"start":$scope.start, "itemsPerPage":$scope.itemsPerPage, "fields": $scope.ngModel});
	}
	
	$scope.$on('queryExecuted', function (event, data) {
		$scope.completeResult = true;
		angular.copy(data.columns, $scope.completeResultsColumns);
		angular.copy(data.data, $scope.previewModel);
		if($scope.firstExecution){
			$scope.openPreviewTemplate(true, $scope.completeResultsColumns, $scope.previewModel, data.results);
			$scope.firstExecution = false;
		}
	});
	
	$scope.$on('start', function (event, data) {
		var start = 0;
		if(data.currentPageNumber>1){
			start = (data.currentPageNumber - 1) * data.itemsPerPage;
		}
		$rootScope.$broadcast('executeQuery', {"start":start, "itemsPerPage":data.itemsPerPage});
	});
	
	$scope.openPreviewTemplate = function (completeResult,completeResultsColumns,previewModel,totalNumberOfItems){
		
		var finishEdit=$q.defer();		
		var config = {
				attachTo:  angular.element(document.body),
				templateUrl: sbiModule_config.contextName +'/qbe/templates/datasetPreviewDialogTemplate.html',
				position: $mdPanel.newPanelPosition().absolute().center(),
				fullscreen :false,
				controller: function($scope,mdPanelRef,sbiModule_translate){
					$scope.model ={ "completeresult": completeResult, "completeResultsColumns": completeResultsColumns, "previewModel": previewModel, "totalNumberOfItems": totalNumberOfItems, "mdPanelRef":mdPanelRef};
					$scope.changeDatasetPage=function(itemsPerPage,currentPageNumber){
						$rootScope.$broadcast('start',{"itemsPerPage":itemsPerPage, "currentPageNumber":currentPageNumber});
					}
					$scope.closePanel = function () {
						mdPanelRef.close();
						mdPanelRef.destroy();
					}
					$scope.translate = sbiModule_translate;
				},
				locals: {completeresult: completeResult, completeResultsColumns: completeResultsColumns, previewModel: previewModel, totalNumberOfItems: totalNumberOfItems},
				hasBackdrop: true,
				clickOutsideToClose: true,
				escapeToClose: true,
				focusOnOpen: true,
				preserveScope: true,
		};
		$mdPanel.open(config);
		return finishEdit.promise;
		
	}	
	$scope.openFilters = function (field){
		$rootScope.$broadcast('openFilters', {"field":field});
	}
	$scope.checkDescription = function (field){
		var desc = "";
		
		for (var i = 0; i < $scope.filters.length; i++) {
			if($scope.filters[i].leftOperandDescription == field.entity+" : "+field.name){

				desc =desc.concat(" "
				+$scope.filters[i].operator + " " +$scope.filters[i].rightOperandDescription + "\n") ;
			}
		}
		return desc;

	}
	$scope.openDialogForParams = function (model){
		$rootScope.$broadcast('openDialogForParams');
	}

	$scope.$watch('ngModel',function(newValue,oldValue){
		if(newValue[0]){
			$scope.isChecked = newValue[0].distinct;
		}
	},true);

	$scope.distinctSelected = function (){
		$rootScope.$broadcast('distinctSelected');
	}

	$scope.showHiddenColumns = function () {
		for ( var field in $scope.ngModel) {
			$scope.ngModel[field].visible = true;
		}
		$rootScope.$broadcast('showHiddenColumns', true);
	}
	
	$scope.idIndex = Array.apply(null, {length: 25}).map(Number.call, Number);
	
    
	$scope.basicViewColumns = [
								{
	                            	"label":$scope.translate.load("kn.qbe.custom.table.entity"),
	                            	"name":"entity"
	                        	},
	                        	{
	                        		"label":$scope.translate.load("kn.qbe.general.field"),
	                            	"name":"name"
	                        	},
	                        	{
	                        		"label":$scope.translate.load("kn.qbe.custom.table.group"),
	                            	"name":"group",
	                    			hideTooltip:true,
	                            	transformer: function() {
	                            		return '<md-checkbox ng-model=row.group aria-label="Checkbox"></md-checkbox>';
	                            	}
	                        	},
	                        	{
	                        		"label":$scope.translate.load("kn.qbe.custom.table.function"),
	                            	"name":"function",
	                            	hideTooltip:true,
	                            	transformer: function() {
	                            		return '<md-select ng-model=row.funct class="noMargin" ><md-option ng-repeat="col in scopeFunctions.aggregationFunctions" value="{{col}}">{{col}}</md-option></md-select>';
	                            	}
	                        	},
	                        	{
	                        		"label":$scope.translate.load("kn.qbe.general.filters"),
	                            	"name":"filters",
	                    			hideTooltip:true,
	                            	transformer: function() {
	                            		return '<md-icon class="fa fa-filter" ng-click="scopeFunctions.openFilters(row)"></md-icon>';
	                            	}
	                        	},
	                        	{
	                        		"label":$scope.translate.load("kn.qbe.custom.table.move.up"),
	                            	"name":"function",
	                    			hideTooltip:true,
	                            	transformer: function() {
	                            		return '<md-icon class="fa fa-angle-up" ng-click="scopeFunctions.moveUp(row)"></md-icon> ';
	                            	}
	                        	},
	                        	{
	                        		"label":$scope.translate.load("kn.qbe.custom.table.move.down"),
	                            	"name":"function",
	                    			hideTooltip:true,
	                            	transformer: function() {
	                            		return '<md-icon class="fa fa-angle-down" ng-click="scopeFunctions.moveDown(row)"></md-icon>';
	                            	}
	                        	},
	                        	{
	                        		"label":$scope.translate.load("kn.qbe.custom.table.show.field"),
	                            	"name":"visible",
	                    			hideTooltip:true,
	                            	transformer: function() {
	                            		return '<md-checkbox ng-checked="scopeFunctions.isVisible(row)" ng-click="scopeFunctions.setVisibility(row)"  aria-label="Checkbox"></md-checkbox>';
	                            	}
	                        	},
	                        	{
	                        		"label":$scope.translate.load("kn.qbe.custom.table.delete.field"),
	                            	"name":"function",
	                    			hideTooltip:true,
	                            	transformer: function() {
	                            		return '<md-icon class="fa fa-remove" ng-click="scopeFunctions.deleteField(row)"></md-icon>';
	                            	}
	                        	}
	]
	
	$scope.basicViewScopeFunctions = {
		aggregationFunctions: $scope.aggFunctions,
		deleteField : function (row) {
			$scope.removeColumn(row);
		},
		moveUp : function (row) {
			$scope.moveLeft(row.order, row);
			
		},
		moveDown : function (row) {
			$scope.moveRight(row.order, row);
			
		},
		openFilters : function (row) {
			$scope.openFilters(row);
		},
		isGrouped : function (row){
			for (var i = 0; i < $scope.ngModel.length; i++) {
				if($scope.ngModel[i].id==row.id && $scope.ngModel[i].group==true){
					return true;
				}
			}
		},
		isVisible : function (row) {
			for (var i = 0; i < $scope.ngModel.length; i++) {
				if($scope.ngModel[i].id==row.id && $scope.ngModel[i].visible==true){
					return true;
				}
			}
		},
		setVisibility : function (row) {
			$scope.setVisible(row.id, row.entity, row.visible);
		}
	};

}
})();