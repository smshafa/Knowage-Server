<%@page import="it.eng.knowage.tools.servermanager.utils.LicenseManager"%><%@page
    import="it.eng.spagobi.commons.bo.UserProfile"%><%@page
    import="it.eng.spago.security.IEngUserProfile"%><%@page
    import="it.eng.spagobi.commons.utilities.ChannelUtilities"%><%@page
    import="it.eng.spagobi.commons.utilities.SpagoBIUtilities"%>
<%
    String userName = "";
    String tenantName = "";
    IEngUserProfile userProfile = (IEngUserProfile) session.getAttribute(IEngUserProfile.ENG_USER_PROFILE);
    if (userProfile != null) {
    	userName = (String) ((UserProfile) userProfile).getUserName();
    	tenantName = (String) ((UserProfile) userProfile).getOrganization();
    }
    String contextName = ChannelUtilities.getSpagoBIContextName(request);
    String myHostName = SpagoBIUtilities.getCurrentHostName();
    int cpuNumber = Runtime.getRuntime().availableProcessors();
    %>
<md-dialog aria-label="{{title}}" ng-cloak flex="40" id="licenseDialog"
    class="kn-license">
    <md-toolbar>
        <div class="md-toolbar-tools">
            <h2>
                {{title}} - MyHostName:
                <%=myHostName%>
            </h2>
            <span flex></span>
        </div>
    </md-toolbar>
    <md-dialog-content>
        <md-tabs
            md-selected="selectedIndex" md-autoselect md-dynamic-height
            ng-if="hosts.length>0">
            <md-tab ng-repeat="host in hosts"
                label="{{host.hostName}}">
                <div class="licenseTopButtons" layout="row" layout-wrap
                    layout-align="center center">
                    <div layout="row" layout-align="center" title="{{translate.load('kn.license.dataRequired')}}">
                        <div layout="column">
                            <div class="kn-info kn-align-left no-uppercase">
                                <div layout="row" layout-wrap>
                                    <span flex=20> <strong>{{translate.load('kn.license.hostName')}}:
                                    </strong>
                                    </span> <span flex=80> {{host.hostName}} </span> <span flex=20> <strong>{{translate.load('kn.license.hardwareId')}}:
                                    </strong>
                                    </span> <span flex=80> {{host.hardwareId}} </span> <span flex=20> <strong>{{translate.load('kn.license.cpuNum')}}:
                                    </strong>
                                    </span> <span flex=80><%=cpuNumber%> </span>
                                </div>
                            </div>
                        </div>
                        <div layout="column" class="importButtonContainer">
                            <label ng-disabled="ngDisabled" id="upload_license"
                                class="md-knowage-theme md-button md-fab md-mini" md-ink-ripple
                                for="upload_license_input" layout="row">
                                <md-icon md-font-set="fa"
                                    md-font-icon="fa fa-plus"></md-icon>
                            </label>
                            <input ng-disabled="ngDisabled" id="upload_license_input"
                                type="file" class="ng-hide" aria-label="upload_license_input"
                                onchange="angular.element(this).scope().setAndUploadFile(this,
                                false,
                                angular.element(this).scope().license,
                                angular.element(this).scope().host.hostName)"
                                accept=".lic" />
                            <!--             <md-button ng-if="file && !isForUpdate" ng-click="uploadFile(host.hostName)" aria-label="menu" class="md-fab md-mini md-primary"> -->
                            <!--                 <md-icon md-font-set="fa" md-font-icon="fa fa-upload"></md-icon> -->
                            <!--              </md-button> -->
                        </div>
                    </div>
                </div>
                <md-list class="md-dense" layout="column">
                    <md-list-item flex
                        class="md-2-line" ng-repeat="license in licenseData[host.hostName]">
                        <img
                            ng-src="/knowage/themes/commons/img/licenseImages/{{license.product}}.png"
                            class="md-avatar" alt="{{license.product}}" style="border-radius: 0;"/>
                        <div flex class="md-list-item-text">
                            <h3>{{license.product}}</h3>
                            <p
                                ng-class="{'kn-success': license.status == 'LICENSE_VALID' ,'kn-danger':license.status !== 'LICENSE_VALID'}">
                                <span ng-if="license.status == 'LICENSE_VALID'"> <br />
                                {{translate.load('kn.license.valid')}}
                                </span> <span ng-if="license.status != 'LICENSE_VALID'"> <br />
                                {{translate.load('kn.license.invalid')}}
                                </span> <span ng-if="license.expiration_date"> <br />
                                {{license.expiration_date_format}}
                                </span>
                            </p>
                        </div>
                        <div flex class="md-list-item-text listItemLineHeight">
                            <p>
                                <span> <small>{{translate.load('kn.license.licenseId')}}:</small>
                                </span>
                            </p>
                            <h3>{{license.licenseId}}</h3>
                        </div>
                        <!-- 	         	<md-button class="md-secondary md-icon-button" ng-click="dowloadFile(license, host.hostName)"  > -->
                        <!-- 		        	<md-icon md-font-set="fa" md-font-icon="fa fa-download"></md-icon> -->
                        <!-- 		        </md-button> --> 
                        <md-icon md-font-set="fa"
                            md-font-icon="fa fa-download" md-menu-align-target
                            ng-click="dowloadFile(license, host.hostName)">
                            <md-tooltip
                                md-delay="1000"> {{translate.load('kn.license.download')}}</md-tooltip>
                        </md-icon>
                        <md-input-container>
                            <md-placeholder>
                                <div ng-if="!isForUpdate">
                                    <div ng-if="license.status=='LICENSE_VALID'">
                                        <md-tooltip md-delay="1000">
                                            {{translate.load('kn.license.change')}} 
                                        </md-tooltip>
                                        <md-icon md-font-set="fa" md-font-icon="fa fa-edit"
                                            ng-click="uploadFileChanged()"></md-icon>
                                    </div>
                                    <div ng-if="license.status!='LICENSE_VALID'">
                                        <md-tooltip md-delay="1000">
                                            {{translate.load('kn.license.update')}} 
                                        </md-tooltip>
                                        <md-icon md-font-set="fa" md-font-icon="fa fa-upload"
                                            ng-click="uploadFileChanged()"></md-icon>
                                    </div>
                                </div>
                            </md-placeholder>
                            <input ng-disabled="ngDisabled" id="upload_license_update" type="file"
                                ng-hide="true" aria-label="upload_license_input"
                                onchange="angular.element(this).scope().setAndUploadFile(this, 
                                true,
                                angular.element(this).scope().license,
                                angular.element(this).scope().host.hostName)"
                                accept=".lic" /> 
                        </md-input-container>
                        <!--                  		<md-icon ng-if="!isForUpdate" md-font-set="fa" md-font-icon="fa fa-edit"><input  ng-disabled='ngDisabled' id="upload_license_update" type="file" ng-hide="true" onchange="angular.element(this).scope().setFile(this, true)"></md-icon> -->
                        <!-- <md-icon ng-if="isForUpdate" ng-click="uploadFile(host.hostName, license, isForUpdate)"   md-font-set="fa" md-font-icon="fa fa-upload"></md-icon>-->
                        <md-icon md-font-set="fa" md-font-icon="fa fa-trash"
                            md-menu-align-target
                            ng-click="openDeletingDialog(event, license, host.hostName)">
                            <md-tooltip
                                md-delay="1000"> {{translate.load('kn.license.delete')}} </md-tooltip>
                        </md-icon>
                        <!-- 		        <md-menu><md-button aria-label="Open phone interactions menu" class="md-icon-button"><md-icon md-font-set="fa" md-font-icon="fas fa-ellipsis-v"></md-icon></md-button><md-menu-content><md-menu-item><md-button ng-click="dowloadFile(license, host.hostName)"><md-icon md-font-set="fa" md-font-icon="fa fa-download" md-menu-align-target></md-icon> {{translate.load('kn.license.download')}}
                            </md-button></md-menu-item><md-menu-item><md-button><label ng-disabled='ngDisabled' for="upload_license_update" style="margin:0; padding:0;font-weight: 400"><md-icon ng-if="!isForUpdate" md-font-set="fa" md-font-icon="fa fa-edit"></md-icon> {{translate.load('kn.license.change')}}
                            		</label><input  ng-disabled='ngDisabled' id="upload_license_update" type="file" ng-hide="true" onchange="angular.element(this).scope().setFile(this, true)"><md-icon ng-if="isForUpdate" ng-click="uploadFile(host.hostName, license, isForUpdate)"   md-font-set="fa" md-font-icon="fa fa-upload"></md-icon></md-button></md-menu-item><md-menu-item><md-button ng-click="deleteFile(license, host.hostName)"><md-icon md-font-set="fa" md-font-icon="fa fa-trash" md-menu-align-target></md-icon> {{translate.load('kn.license.delete')}}
                            </md-button></md-menu-item></md-menu-content></md-menu> -->
                        <!--  uncomment this to add the license delete md-button class="md-secondary md-icon-button" ng-click="deleteFile(license, host.hostName)" ><md-icon md-font-set="fa" md-font-icon="fa fa-trash"></md-icon></md-button -->
                        <md-divider></md-divider>
                    </md-list-item>
                </md-list>
            </md-tab>
        </md-tabs>
    </md-dialog-content>
    <md-dialog-actions layout="row">
        <md-button class="md-raised md-primary" ng-click="closeDialog()">
            {{okMessage}} 
        </md-button>
    </md-dialog-actions>
    
<md-card class="innerDialog" ng-if="isDeletingLicense" style="background-color: #fafafa">
 <md-toolbar>
        <div class="md-toolbar-tools">
            <h2>
	{{translate.load('kn.license.delete')}} - {{fileToDelete.license.product}}
	</h2>
	</div>
	</md-toolbar>
	<md-card-content>
		{{fileToDelete.message}}
    </md-card-content>
    <md-dialog-actions layout="row">
    <md-button class="md-raised" ng-click="cancelDeletingOperation()">
        {{translate.load('sbi.general.cancel')}} 
    </md-button>
    <md-button class="md-raised md-primary" ng-click="deleteLicense()">
        {{translate.load('kn.license.delete')}}
    </md-button>
		</md-dialog-actions>    
   </md-card>

<div class="innerDialogBackdrop" ng-if="isDeletingLicense" layout-fill> </div>
</md-dialog>
