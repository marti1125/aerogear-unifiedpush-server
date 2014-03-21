/* JBoss, Home of Professional Open Source
* Copyright Red Hat, Inc., and individual contributors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* http://www.apache.org/licenses/LICENSE-2.0
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

App.MobileAppsIndexController = Ember.ArrayController.extend({
    needs: "application",
    sortProperties: [ "pushApplicationID" ],
    sortAscending: true,
    showVariantDelete: false,
    disableDeleteButton: true,
    applicationPipe: App.AeroGear.pipelines.pipes.applications,
    enableDelete: function() {
        var app = this.get( "content" ).get("appToDelete" );
        if(this.get("confirmAppName") ===  app.name){
            this.set("disableDeleteButton", false);
        }
        else {
            this.set("disableDeleteButton", true);
        }
    }.observes("confirmAppName" ),
    actions: {
        toggleDeleteOverlay: function( app ) {
            if ( this.get( "showDelete" ) ) {
                this.set( "showDelete", false );
                this.set("confirmAppName","");
            }
            else {
                this.set( "showDelete", true );
                this.get( "model" ).set( "appToDelete", app );
            }
        },

        edit: function( controller ) {
            this.get('controllers.application' ).set( "isProcessing", true );
            var that = controller,
                applicationData,
                model = controller.get( "model" );

            model.validate();

            if( !model.get( "isValid" ) ) {
                this.send( "error", controller, model.get( "validationErrors.allMessages" ) );
            } else {
                applicationData = {
                    name: controller.get( "name" ),
                    id: controller.get( "pushApplicationID" ),
                    description: controller.get( "description" )
                };

                this.applicationPipe.save( applicationData, {
                    success: function() {
                        Ember.run( this, function() {
                            $( "form" )[0].reset();
                            that.transitionToRoute( "mobileApps" );
                        });
                    },
                    error: function( error ) {
                        Ember.run( this, function() {
                            switch( error.status ) {
                            case 401:
                                break;
                            default:
                                that.send( "error", that, "Error Saving" );
                                break;
                            }
                        });
                    }
                });
            }
        },
        cancel: function() {
            //Probably a better way
            $( "form" )[0].reset();

            this.transitionToRoute( "mobileApps" );
        },
        remove: function() {
            var things = this.get( "model" ).get("appToDelete"),
                that = this;
            this.applicationPipe.remove( things.pushApplicationID, {
                success: function() {
                    Ember.run( this, function() {
                        var content = that.get( "model" ).get( "content" ),
                           find;

                        find = content.find( function( value ) {
                            return value.pushApplicationID === things.pushApplicationID;
                        });
                        that.set("confirmAppName","");
                        content.removeObject( find );
                    });
                },
                error: function( error ) { // TODO: Maybe Make this a class method?
                    Ember.run( this, function() {
                        switch( error.status ) {
                        case 401:
                            break;
                        default:
                            that.send( "error", that, "Error Saving" );
                            break;
                        }
                    });
                }
            });
            this.send( "toggleDeleteOverlay" );
        }
    },
    totalApps: function() {

        // Compute the total apps for this controller
        return this.get( "model" ).get( "content" ).length;

    }.property( "@each" )
});

/*
    The Controller for adding/editing Mobile apps
*/
App.MobileAppsEditController = Ember.ObjectController.extend({
    needs: ["mobileAppsIndex","application"]
});
