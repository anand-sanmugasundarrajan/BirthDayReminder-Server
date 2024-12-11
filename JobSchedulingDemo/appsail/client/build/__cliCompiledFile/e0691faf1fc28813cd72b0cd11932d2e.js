import { _defineProperty } from "@slyte/core/src/lyte-utils";
var _ = {};

_defineProperty(_, {
    "Component": function() {
        return Component;
    }
});

import "/node_modules/@zoho/lyte-ui-component/components/javascript/lyte-carousel.js";
import "/node_modules/@zoho/lyte-ui-component/components/javascript/lyte-checkbox.js";
import "/node_modules/@zoho/lyte-ui-component/components/javascript/lyte-table.js";
import "/node_modules/@zoho/lyte-ui-component/components/javascript/lyte-input.js";
import "/node_modules/@zoho/lyte-ui-component/components/javascript/lyte-button.js";
import "/node_modules/@zoho/lyte-ui-component/components/javascript/lyte-modal.js";
import { Component } from "./../component.js";

function prop(type, options) {
    return {
        type: type,
        default: options.default
    };
}

class BirthdayReminder extends Component {
    constructor() {
        super();
    }

    data(arg1) {
        return Object.assign(super.data({
            headerJSON: prop('array', {
                default: [
                    { name: 'Name', body: 'name' },
                    { name: 'Message', body: 'message' },
                    { name: 'Birthday', body: 'birthday' },
                    { name: 'Email', body: 'email' }
                ]
            }),
            reminders: prop('array', { default: [] }),
            name: prop('string', { default: '' }),
            message: prop('string', { default: '' }),
            email: prop('string', { default: '' }),
            birthday: prop('string', { default: '' }),
            template: prop('string', { default: '' }),
            editReminder: prop('object', { default: {} }),
            deleteRemind: prop('object', { default: {} }),
            isEditModalVisible: prop('boolean', { default: false }),
            isDeleteModalVisible: prop('boolean', { default: false }),
            isSignOutModalVisible: prop('boolean', { default: false }),
            maxDate: prop('string', { default: this.getCurrentDate() }),
            selectedButton: prop('string', { default: null }),
            selectTemplate: prop('string', { default: '1636000000007022' }),
            userName: prop('string', { default: '' }),
            userId: prop('string', { default: null }),
            userType: prop('string',{ default: null})
        }), arg1);
    }

    getCurrentDate() {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    didConnect() {
        this.loadReminders();
    }
    async loadReminders() {
        try {
            // @ts-ignore
            const userManagement = catalyst.auth;
            
            const response = await userManagement.isUserAuthenticated();
            this.setData('userId', response.content.user_id);
            this.setData('userType', response.content.role_details.role_name);
            const formData = {
                userId: this.getData('userId'),
                userType: this.getData('userType')
             };
                const reminderResponse = await fetch('https://appsail-10091141877.development.catalystappsail.com/execute/getReminder', {
                method: 'POST',  
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
    
            if (!reminderResponse.ok) {
                throw new Error(`HTTP error! Status: ${reminderResponse.status}`);
            }
            const data = await reminderResponse.json();
            this.setData('reminders', data);
    
        } catch (error) {
            console.error('Error loading reminders:', error);
        }
    }



    static methods(arg1) {
        return Object.assign(super.methods({}), arg1);
    }

    static actions(arg1) {
        return Object.assign(super.actions({

            updateReminder() {
                const updatedData = {
                    id: this.getData('editReminder').id,
                    name: this.getData('editReminder').name,
                    birthday: this.getData('editReminder').birthday,
                    message: this.getData('editReminder').message,
                    email: this.getData('editReminder').email,
                    template: this.getData('selectTemplate')
                };

                fetch('https://appsail-10091141877.development.catalystappsail.com/execute/updateReminder', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ method: 'updateReminder', ...updatedData })
                }).then(response => response.json())
                    .then(data => {
                        // @ts-ignore
                        document.getElementById("editReminderModal").ltProp('show', false);
                        alert('Reminder updated successfully!');
                        this.loadReminders();
                        this.setData('isEditModalVisible', false);
                    }).catch(error => {
                        console.error('Error updating reminder:', error);
                        alert('Failed to update reminder.');
                    });

            },

            deleteReminder() {
                const data = {
                    id: this.getData('deleteRemind').id
                };

                fetch('https://appsail-10091141877.development.catalystappsail.com/execute/deleteReminder', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ ...data })
                }).then(response => response.json())
                    .then(data => {
                        alert('Reminder deleted successfully!');
                        // @ts-ignore
                        document.getElementById("deleteReminderModal").ltProp('show', false);
                        this.setData('isDeleteModalVisible', false);
                        this.loadReminders();
                    }).catch(error => {
                        console.error('Error deleting reminder:', error);
                        alert('Failed to delete reminder.');
                    });
            },
            signOut(){
                const directURL = 'https://appsail-10091141877.development.catalystappsail.com/__catalyst/auth/signup'
                // @ts-ignore
                catalyst.auth.signOut(directURL);
            },
            signIntoZoho(){
                const directURL = 'https://appsail-10091141877.development.catalystappsail.com/__catalyst/auth/login'
                // @ts-ignore
                catalyst.auth.signOut(directURL);
            },



            toggleAutoSend(id, checked) {
                fetch('https://appsail-10091141877.development.catalystappsail.com/execute/toggleAutoSend', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: id, status: checked ? 'enable' : 'disable' })
                }).then(response => response.json())
                    .then(data => {
                        console.log('Auto-send toggled successfully!');
                        this.loadReminders();
                    }).catch(error => {
                        console.error('Error toggling auto-send:', error);
                        alert('Failed to toggle auto-send.');
                    });
            },

            openEditModal(id, name, birthday, message, email) {
                this.setData('editReminder', { id, name, birthday, message, email });
                // @ts-ignore
                document.getElementById("editReminderModal").ltProp('show', true);
                // this.$L("#editReminderModal")[0].ltProp('show', true)
            },
            openSignOutModal() {
                // @ts-ignore
                document.getElementById("signOut-modal").ltProp('show', true);
            },

            closeEditModal() {
                this.setData('isEditModalVisible', false);
                // @ts-ignore
                document.getElementById("editReminderModal").ltProp('show', false);
                // this.$L("#editReminderModal")[0].ltProp('show', false)

            },
            openDeleteModal(id) {
                this.setData('deleteRemind', { id });
                // @ts-ignore
                document.getElementById("deleteReminderModal").ltProp('show', true);


            },
            closeDeleteModal() {
                this.setData('deleteReminderModal', false);
                // @ts-ignore
                document.getElementById("deleteReminderModal").ltProp('show', false);
            },
            async submitForm(event) {
                if (event) event.preventDefault();
            
                try {
                    const name = this.getData('name');
                    const birthday = this.getData('birthday');
                    const message = this.getData('message');
                    const email = this.getData('email');
                    const userId = this.getData('userId');
                    const userType = this.getData('userType');
            
                    const carouselElement = document.querySelector('.carousel-item.lyteActive');
                    if (!carouselElement) {
                        alert('Carousel element not found.');
                        return;
                    }
            
                    const template = carouselElement.getAttribute('data-template-id');
                    if (!template) {
                        alert('No template ID found for the active carousel item.');
                        return;
                    }
            
                    const today = new Date();
                    const yyyy = today.getFullYear();
                    const mm = String(today.getMonth() + 1).padStart(2, '0');
                    const dd = String(today.getDate()).padStart(2, '0');
                    const now = `${yyyy}-${mm}-${dd}`;
            
                    if (now < birthday) {
                        alert('Enter a valid past date');
                        return;
                    }
            
                    // Email validation logic
                    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    const isValidEmail = re.test(String(email).toLowerCase());
            
                    if (!isValidEmail) {
                        alert('Invalid email format');
                        return;
                    }
            
                    if (!name || !message || !email || !birthday || !template) {
                        alert('All fields are required');
                        return;
                    }
            
                    const formData = {
                        name,
                        birthday,
                        message,
                        email,
                        template, 
                        userId,
                        userType
                    };
            
                    const response = await fetch('https://appsail-10091141877.development.catalystappsail.com/execute/insertReminder', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });
            
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
            
                    alert('Reminder added successfully!');
                    this.loadReminders();
                } catch (error) {
                    console.error('Error adding reminder:', error);
                    alert('Failed to add reminder.');
                }
            }
        }), arg1);
    }



    static observers(arg1) {
        return Object.assign(super.observers({}), arg1);
    }

    _() {
        _;
    }
}

BirthdayReminder._template = "<template tag-name=\"birthday-reminder\"> <script src=\"/birthday-reminder/components/javascript/birthday-reminder.js\"></script> <div class=\"container mt-5 mb-5\"> <h4 id=\"username\"> </h4> <button id=\"signout-button\" class=\"btn btn-danger\" onclick=\"{{action('openSignOutModal')}}\">Sign Out</button> <h2>Birthday Reminder</h2> <div class=\"row\"> <div class=\"form-group col-md-6\"> <lyte-input lt-prop-label=\"Name:\" lt-prop-appearance=\"box\" lt-prop-direction=\"horizontal\" lt-prop-placeholder=\"Enter your name\" lt-prop-required=\"true\" lt-prop-name=\"name\" lt-prop-id=\"name\" lt-prop-value=\"{{lbind(name)}}\"></lyte-input> </div> <div class=\"form-group col-md-6\"> <lyte-input lt-prop-label=\"Birthday:\" lt-prop-appearance=\"box\" lt-prop-direction=\"horizontal\" lt-prop-type=\"date\" lt-prop-placeholder=\"Enter your Birthday\" lt-prop-required=\"true\" lt-prop-name=\"birthday\" lt-prop-id=\"birthday\" lt-prop-value=\"{{lbind(birthday)}}\" lt-prop-format=\"YYYY-MM-DD\" max=\"{{maxDate}}\"></lyte-input> </div> </div> <div class=\"row\"> <div class=\"form-group col-md-6\"> <lyte-input lt-prop-label=\"Message:\" lt-prop-appearance=\"box\" lt-prop-direction=\"horizontal\" lt-prop-required=\"true\" lt-prop-placeholder=\"Please enter any message\" lt-prop-name=\"message\" lt-prop-id=\"message\" lt-prop-value=\"{{lbind(message)}}\"></lyte-input> </div> <div class=\"form-group col-md-6\"> <lyte-input lt-prop-label=\"Email:\" lt-prop-appearance=\"box\" lt-prop-direction=\"horizontal\" lt-prop-type=\"email\" lt-prop-placeholder=\"Enter your Email\" lt-prop-required=\"true\" lt-prop-name=\"email\" lt-prop-id=\"email\" lt-prop-value=\"{{lbind(email)}}\"></lyte-input> </div> </div> <br> <h2>Choose a template</h2> <lyte-carousel lt-prop-active-index=\"0\" lt-prop-orientation=\"horizontal\" lt-prop-effect=\"fade\" lt-prop-records=\"4\" lt-prop-data=\"{{yourData}}\" lt-prop-auto-play=\"false\"> <template is=\"registerYield\" yield-name=\"carouselBoxYield\"> <lyte-carousel-prev> </lyte-carousel-prev> <lyte-carousel-content> <lyte-carousel-item class=\"carousel-item\" data-template-id=\"1636000000011009\"> <div class=\"template-1-card\"> <div class=\"template-1-card-header\">Happy birthday {{name}}</div> <div class=\"template-1-card-body\"> <br> <b>{{message}}</b><br><br> I pray that God blesses you with all the good things in life―health, <br> wealth, happiness, and success.<br> May your dreams come true and may you achieve all that you set out to do.<br> <br><br><br> </div> </div> </lyte-carousel-item> <lyte-carousel-item class=\"carousel-item\" data-template-id=\"1636000000011005\"> <div class=\"template-2-container-card\"> <div class=\"template-2-left-container-card\"> <img src=\"https://funtikka.com/wp-content/uploads/2024/02/happy-birthday-quotes1.jpg\" alt=\"Birthday Image\" class=\"birthday\"> </div> <div class=\"template-2-right-container-card\"> <div class=\"template-2-text\"> <br> \"Wishing you a day that's as special as you,<br> Filled with laughter, joy, and memories too.\"<br> {{message}}<br> Happy birthday {{name}} may it be sublime,<br> A truly wonderful and memorable time.\"<br><br> </div> </div> </div> </lyte-carousel-item> <lyte-carousel-item class=\"carousel-item lyteActive\" data-template-id=\"1636000000011001\"> <div class=\"template-3-card\"> <img src=\"https://cdn.pixabay.com/photo/2020/10/06/21/54/cake-5633461__480.png\" class=\"birthday\" alt=\"Birthday Image\"> <div class=\"template-3-text\"> <h1>Happy Birthday {{name}}!</h1> <p>{{message}}</p> </div> </div> </lyte-carousel-item> <lyte-carousel-item class=\"carousel-item\" data-template-id=\"1636000000011013\"> <div class=\"template-4-card\"> <div class=\"template-4-card-content\"> <div class=\"template-4-card-header\"> <h1>Celebrate with Us!</h1> </div> <div class=\"template-4-card-body\"> <p>Happy Birthday {{name}}</p> <p>{{message}}</p> </div> <div class=\"template-4-card-footer\"> <p></p> </div> </div> </div> </lyte-carousel-item> <lyte-carousel-indicator> <lyte-carousel-indicator-item data-value=\"0\"> </lyte-carousel-indicator-item> <lyte-carousel-indicator-item data-value=\"1\"> </lyte-carousel-indicator-item> <lyte-carousel-indicator-item data-value=\"2\"> </lyte-carousel-indicator-item> <lyte-carousel-indicator-item data-value=\"3\"> </lyte-carousel-indicator-item> </lyte-carousel-indicator> </lyte-carousel-content> <p class=\"note\"><b>Note:The template currently visible on the screen at the time of form submission is considered the selected template.</b></p> <lyte-carousel-next> </lyte-carousel-next> </template> </lyte-carousel> <div class=\"row\"> <div class=\"form-group col-md-12\"> <lyte-button onclick=\"{{action('submitForm',event)}}\" lt-prop-appearance=\"success\" lt-prop-type=\"submit\" lt-prop-size=\"large\" lt-prop-auto-focus=\"true\"> <template is=\"registerYield\" yield-name=\"text\"> Submit </template> </lyte-button> </div> </div> <lyte-table lt-prop-yield=\"true\"> <template is=\"registerYield\" yield-name=\"yield\"> <lyte-table-structure> <lyte-thead> <lyte-tr> <template is=\"for\" _jsp=\"true\" items=\"{{headerJSON}}\" item=\"list\" index=\"index\"> </template> </lyte-tr> </lyte-thead> <lyte-tbody> <template is=\"for\" _jsp=\"true\" items=\"{{reminders}}\" item=\"list\" index=\"index\"> <lyte-tr> <template is=\"for\" _jsp=\"true\" items=\"{{headerJSON}}\" item=\"header\" index=\"index\"> </template> <lyte-td> <div class=\"d-flex w-100 justify-content-between align-items-center\"> <div> <h5 class=\"mb-1\">{{list.Name}}</h5> <small>{{list.BirthDay}}</small> <p class=\"mb-1\">{{list.Message}}</p> <small>{{list.Email}}</small> </div> <div class=\"d-flex align-items-center\"> <lyte-checkbox lt-prop-value=\"1\" lt-prop-tabindex=\"0\" lt-prop-type=\"switch\" lt-prop-id=\"autoSend_{{list.ID}}\" lt-prop-checked=\"{{lbind(list.AutoSend)}}\" lt-prop-label=\"\" lt-prop-name=\"checkbox\" onchange=\"{{action('toggleAutoSend',list.ID,list.AutoSend)}}\"> </lyte-checkbox> <div class=\"d-flex align-items-center ms-2\"> <button class=\"btn btn-secondary btn-sm me-2\" onclick=\"{{action('openEditModal',list.ID,list.Name,list.BirthDay,list.Message,list.Email)}}\">Edit</button> <button class=\"btn btn-danger btn-sm\" onclick=\"{{action('openDeleteModal',list.ID)}}\">Delete</button> </div> </div> </div> </lyte-td> </lyte-tr> </template> </lyte-tbody> </lyte-table-structure> </template> </lyte-table> </div> <lyte-modal id=\"editReminderModal\"> <template is=\"registerYield\" yield-name=\"modal\"> <lyte-modal-header> Edit Reminder </lyte-modal-header> <lyte-modal-content> <form id=\"editReminderForm\" onsubmit=\"{{action('updateReminder',event)}}\"> <input type=\"hidden\" lt-prop-id=\"edit-id\" lt-prop-value=\"{{lbind(editReminder.id)}}\"> <table cellpadding=\"0\" cellspacing=\"0\" class=\"w100per modalTable\"> <tbody> <tr> <td class=\"pB10 pR30 alignRight\">Name</td> <td class=\"pB10 mymodalinput\"> <lyte-input lt-prop-type=\"text\" lt-prop-appearance=\"box\" lt-prop-id=\"edit-name\" lt-prop-placeholder=\"\" lt-prop-value=\"{{lbind(editReminder.name)}}\" lt-prop-required=\"true\"> </lyte-input> </td> </tr> <tr> <td class=\"pB10 pR30 alignRight\">Birthday</td> <td class=\"pB10 mymodalinput\"> <lyte-input lt-prop-type=\"date\" lt-prop-appearance=\"box\" lt-prop-id=\"edit-birthday\" lt-prop-placeholder=\"\" lt-prop-value=\"{{lbind(editReminder.birthday)}}\" lt-prop-format=\"YYYY-MM-DD\" lt-prop-required=\"true\"> </lyte-input> </td> </tr> <tr> <td class=\"pB10 pR30 alignRight\">Message</td> <td class=\"pB10 mymodalinput\"> <lyte-input lt-prop-type=\"text\" lt-prop-appearance=\"box\" lt-prop-id=\"edit-message\" lt-prop-placeholder=\"\" lt-prop-value=\"{{lbind(editReminder.message)}}\" lt-prop-required=\"true\"> </lyte-input> </td> </tr> <tr> <td class=\"pB10 pR30 alignRight\">Email</td> <td class=\"pB10 mymodalinput\"> <lyte-input lt-prop-type=\"email\" lt-prop-appearance=\"box\" lt-prop-id=\"edit-email\" lt-prop-placeholder=\"\" lt-prop-value=\"{{lbind(editReminder.email)}}\" lt-prop-required=\"true\"> </lyte-input> </td> </tr> </tbody> </table> <div class=\"text-center\"> <lyte-button onclick=\"{{action('updateReminder')}}\" lt-prop-appearance=\"primary\" type=\"submit\"> <template is=\"registerYield\" yield-name=\"text\">Save changes</template> </lyte-button> <lyte-button onclick=\"{{action('closeEditModal')}}\"> <template is=\"registerYield\" yield-name=\"text\">Cancel</template> </lyte-button> </div> </form> </lyte-modal-content> </template> </lyte-modal> <lyte-modal id=\"deleteReminderModal\"> <template is=\"registerYield\" yield-name=\"modal\"> <lyte-modal-header> DELETE REMINDER </lyte-modal-header> <p>Are you sure to delete reminder?</p> <lyte-modal-footer class=\"right\"> <lyte-button lt-prop-appearance=\"primary\" onclick=\"{{action('deleteReminder')}}\"> <template is=\"registerYield\" yield-name=\"text\"> DELETE </template> </lyte-button> <lyte-button onclick=\"{{action('closeDeleteModal')}}\"> <template is=\"registerYield\" yield-name=\"text\"> Cancel </template> </lyte-button> </lyte-modal-footer> </template> </lyte-modal> <lyte-modal id=\"signOut-modal\"> <template is=\"registerYield\" yield-name=\"modal\"> <lyte-modal-header> </lyte-modal-header> <p>Thanks for using our application!</p> <a class=\"signUp\" onclick=\"{{action('signOut')}}\">SignUp</a> <a class=\"exit\" onclick=\"{{action('signIntoZoho')}}\">Login</a><br> <lyte-modal-footer class=\"right\"><br><br> <center> Zoho Catalyst</center> </lyte-modal-footer> </template> </lyte-modal> </template><style>/* General container styles */\n.container, .signin-container, .account-container {\n  padding: 40px;\n  margin-top: 50px;\n  margin-bottom: 50px;\n  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);\n  border-radius: 8px;\n}\nlyte-button{\n  margin-left :550px;\n}\n\n/* Specific container styles */\n.container {\n  background-image: linear-gradient(to bottom, #ffffff, #f2f2f2);\n}\n\n.signin-container {\n  background-image: linear-gradient(to bottom, #f2f2f2, #ffffff);\n  height: 600px;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n\n.account-container {\n  background-image: linear-gradient(to bottom, #ffffff, #f2f2f2);\n  height: 100px;\n  text-align: center;\n}\n\n.account-container p {\n  font-size: 16px;\n  color: #333;\n}\n\n.account-container button {\n  background-color: #11a1a1;\n  border: none;\n  color: white;\n  padding: 10px 20px;\n  text-align: center;\n  text-decoration: none;\n  display: inline-block;\n  font-size: 16px;\n  margin: 4px 2px;\n  border-radius: 4px;\n  cursor: pointer;\n  transition: background-color 0.3s ease;\n}\n\n.account-container button:hover {\n  background-color: #0e7d7d;\n}\n\n.account-container a {\n  color: white;\n  text-decoration: none;\n}\n\niframe {\n  background-image: linear-gradient(to bottom, #f2f2f2, #ffffff);\n  height: 600px;\n  width: 600px;\n  border-radius: 8px;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n\n/* Sign-in container styles */\n.signin-container h2 {\n  font-size: 24px;\n  color: #11a1a1;\n  margin-bottom: 20px;\n}\n.right{\n  text-align: center;\n}\n/* Headings */\nh2, h3 {\n  background: linear-gradient(to right, rgb(11, 121, 121), rgb(11, 121, 121));\n  background-clip: text;\n  -webkit-text-fill-color: transparent;\n  text-align: center;\n}\n\nh3 {\n  font-size: 1.5rem;\n  margin-bottom: 10px;\n}\n\n/* Form labels and inputs */\nlabel {\n  transition: color 0.3s ease;\n}\n\nlabel:hover {\n  color: grey;\n}\n\n/* input[type=\"text\"], input[type=\"date\"], select {\n  height: 40px; \n  width: 400px;\n} */\nlyte-input{\n  height: 40px; \n  width: 400px;\n}\n\n.form-group {\n  display: flex;\n  align-items: center;\n  margin-bottom: 10px;\n}\n\n.form-group label {\n  flex: 0 0 200px;\n  margin-right: 10px;\n}\n\n.form-group input, .form-group select {\n  flex: 1;\n}\n\ninput[type=\"submit\"] {\n  background-image: linear-gradient(to right, rgb(11, 121, 121), rgb(11, 121, 121));\n  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);\n  margin-top: 15px;\n  width: 150px;\n  margin-left :550px;\n}\n\ninput[type=\"submit\"]:hover {\n  background-image: linear-gradient(to right, rgb(11, 121, 121), rgb(11, 121, 121));\n}\n\ninput[type=\"checkbox\"] {\n  margin: 20px;\n}\n\n/* Toggle switch */\n.switch {\n  position: relative;\n  display: inline-block;\n  width: 40px;\n  height: 20px;\n}\n\n.switch input {\n  opacity: 0;\n  width: 0;\n  height: 0;\n}\n\n.slider {\n  position: absolute;\n  cursor: pointer;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background-color: #ccc;\n  transition: .4s;\n}\n\n.slider:before {\n  position: absolute;\n  content: \"\";\n  height: 16px;\n  width: 16px;\n  left: 2px;\n  bottom: 2px;\n  background-color: white;\n  transition: .4s;\n}\n\ninput:checked + .slider {\n  background-color: #2196F3;\n}\n\ninput:focus + .slider {\n  box-shadow: 0 0 1px #2196F3;\n}\n\ninput:checked + .slider:before {\n  transform: translateX(18px);\n}\n\n.slider.round {\n  border-radius: 20px;\n}\n\n.slider.round:before {\n  border-radius: 50%;\n}\n\n/* Carousel styles */\n.carousel-container {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  margin: 20px;\n  position: relative;\n}\n\n.carousel {\n  overflow: hidden;\n  width: 100%;\n  border: 2px solid black;\n  position: relative;\n}\n\n.carousel-track {\n  display: flex;\n  transition: transform 0.3s ease;\n}\n\n.carousel img {\n  max-width: 100%;\n  display: block;\n  margin: 0 10px;\n}\n\n.carousel-button {\n  background-color: #008cba;\n  border: none;\n  color: white;\n  padding: 10px 20px;\n  font-size: 16px;\n  cursor: pointer;\n  position: absolute;\n  top: 50%;\n  transform: translateY(-50%);\n}\n\n.carousel-button.prev {\n  left: 10px;\n}\n\n.carousel-button.next {\n  right: 10px;\n}\n\n.carousel-button:hover {\n  background-color: #005f5f;\n}\n\n/* Form container styles */\n.form-container {\n  margin-bottom: 20px;\n}\n\n.carousel-item .text {\n  padding: 20px;\n  background: rgba(255, 255, 255, 0.7);\n  border-radius: 5px;\n  text-align: center;\n}\n\n.carousel-item img.birthday {\n  width: 100%;\n  max-width: 300px;\n  border-radius: 5px;\n}\n\n.carousel-item h1 {\n  color: #333;\n  font-size: 1.5rem;\n  margin-bottom: 10px;\n}\n\n.carousel-item p {\n  color: #666;\n  font-size: 1rem;\n}\n\n.credit {\n  margin-top: 10px;\n  font-size: 0.875rem;\n  color: #999;\n}\n\n.carousel-item .card {\n  border: none;\n}\n\n#signout-button {\n  position: absolute;\n  top: 60px;\n  right: 115px;\n  z-index: 1000;\n}\n\n.carousel-control-prev, .carousel-control-next {\n  filter: invert(100%);\n}\n.carousel-control-prev,\n.carousel-control-next {\n    filter: invert(100%);\n}\n\n.form-container {\n    margin-bottom: 20px;\n}\n\n/* General Styles for Carousel Items */\n.carousel-item {\n    height: 400px;\n    /* Fixed height for all carousel items */\n    transition: transform 0.5s ease;\n    /* Smooth transition for carousel items */\n}\n\n.carousel-item img.birthday {\n    width: auto;\n    max-height: 300px;\n    object-fit: contain;\n    margin: auto;\n}\n\n/* New Styles for the Container Div */\n.carousel-container {\n    padding: 20px;\n    background-color: #f8f9fa;\n    /* Light background for contrast */\n    border-radius: 10px;\n    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);\n}\n\n/* Form Validation Styles */\n.is-invalid {\n    border-color: #dc3545;\n    /* Bootstrap danger color */\n}\n\n.invalid-feedback {\n    display: none;\n    /* Hide feedback by default */\n}\n\n.is-invalid~.invalid-feedback {\n    display: block;\n    /* Show feedback when input is invalid */\n}\n\n.switch {\n    position: relative;\n    display: inline-block;\n    width: 40px;\n    height: 20px;\n}\n\n.switch input {\n    opacity: 0;\n    width: 0;\n    height: 0;\n}\n\n.slider {\n    position: absolute;\n    cursor: pointer;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    background-color: #ccc;\n    transition: .4s;\n}\n\n.slider:before {\n    position: absolute;\n    content: \"\";\n    height: 16px;\n    width: 16px;\n    left: 2px;\n    bottom: 2px;\n    background-color: white;\n    transition: .4s;\n}\n\ninput:checked+.slider {\n    background-color: #2196F3;\n}\n\ninput:focus+.slider {\n    box-shadow: 0 0 1px #2196F3;\n}\n\ninput:checked+.slider:before {\n    transform: translateX(18px);\n}\n\n/* Rounded sliders */\n.slider.round {\n    border-radius: 20px;\n}\n\n.slider.round:before {\n    border-radius: 50%;\n}\n\n.reminder-item {\n    margin-bottom: 20px;\n    padding: 10px;\n    border: 1px solid #ccc;\n    border-radius: 5px;\n}\n\n.reminder-item .controls {\n    margin-top: 10px;\n}\n/* Carousel Styles */\n.carousel-control-prev,\n.carousel-control-next {\n    filter: invert(100%);\n}\n\n/* General Styles for Carousel Items */\n.carousel-item {\n    height: 400px;\n    /* Fixed height for all carousel items */\n    transition: transform 0.5s ease;\n    /* Smooth transition for carousel items */\n}\n\n.carousel-item img.birthday {\n    width: auto;\n    max-height: 450px;\n    object-fit: contain;\n    margin: auto;\n}\n\n.card-footer {\n  font-size: 1em;\n  color: #555;\n}\n\n.card-footer p {\n  margin: 5px 0;\n}\n.card-footer1 {\n  font-size: 1em;\n  color: black;\n}\n\n.card-footer p {\n  margin: 5px 0;\n}\n/* .top-right-button {\n  position: absolute;\n  top: 10px; \n  right: 10px; \n  background-color: black; \n  color: white; \n  border: none; \n  padding: 5px 10px; \n  font-size: 12px; \n  cursor: pointer; \n  border-radius: 3px;\n} *//* Initial button styles */\n.top-right-button {\n  width: 50px;\n  height: 50px;\n  border-radius: 50%;\n  background-color: #3498db; /* Initial color */\n  color: white;\n  border: none;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 18px;\n  cursor: pointer;\n  position: relative;\n  transition: background-color 0.3s ease, transform 0.3s ease;\n}\n\n/* Button active (after click) styles */\n.top-right-button.clicked {\n  background-color: #2ecc71; /* Change color after click */\n  transform: scale(1.1); /* Slightly enlarge the button */\n  color: transparent; /* Hide the original text */\n}\n\n.top-right-button.clicked::before {\n  content: '\\2714'; /* Unicode tick mark */\n  font-size: 24px;\n  color: white;\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n}\n\n\n/* Optionally hide the button text after click */\n.top-right-button.clicked::after {\n  content: '';\n  visibility: hidden;\n}\n\n.signUp{\n  position: absolute;\n  bottom: 80px; /* Adjust as needed */\n  right: 30px; /* Adjust as needed */\n  background-color: black; /* Button color */\n  color: white; /* Text color */\n  border: none; /* Remove border */\n  padding: 5px 10px; /* Adjust padding for button size */\n  font-size: 12px; /* Font size for small button */\n  cursor: pointer; /* Pointer cursor on hover */\n  border-radius: 3px; /* Rounded corners */\n  background-color: #3498db;\n  color: white;\n  padding: 10px 20px;\n  font-size: 1rem;\n  border: none;\n  border-radius: 5px;\n  cursor: pointer;\n  transition: background-color 0.3s ease;\n  margin: 0 5px;\n  background-color: #2980b9;\n}\n.exit{\n  position: absolute;\n  bottom: 80px; /* Adjust as needed */\n  right: 130px; /* Adjust as needed */\n  color: white; /* Text color */\n  font-size: 12px; /* Font size for small button */\n  cursor: pointer; /* Pointer cursor on hover */\n  border-radius: 3px; /* Rounded corners */\n  background-color: #3498db;\n  padding: 10px 20px;\n  font-size: 1rem;\n  border: none;\n  border-radius: 5px;\n  cursor: pointer;\n  transition: background-color 0.3s ease;\n  margin: 0 5px;\n  background-color: red;\n}\n.top-right-button:hover {\n  background-color: #333; /* Darker shade on hover */\n}\n.top-right-button1 {\n  position: absolute;\n  top: 10px; /* Adjust as needed */\n  right: 10px; /* Adjust as needed */\n  background-color: white; /* Button color */\n  color: blue; /* Text color */\n  border: none; /* Remove border */\n  padding: 5px 10px; /* Adjust padding for button size */\n  font-size: 12px; /* Font size for small button */\n  cursor: pointer; /* Pointer cursor on hover */\n  border-radius: 3px; /* Rounded corners */\n}\n\n.top-right-button1:hover {\n  background-color: wheat; /* Darker shade on hover */\n}\n/* Carousel container styles */\nlyte-carousel {\n  display: block;\n  position: relative;\n  width: 80%; /* Adjust width as needed */\n  max-width: 1200px; /* Optional: Max-width for larger screens */\n  height: 500px; /* Adjust height as needed */\n  margin: 20px auto;\n}\n\n/* Carousel item styles */\nlyte-carousel-item {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100%; /* Ensure each item takes up full height */\n}\n\n/* Template card styles */\n.template-1-card,\n.template-2-container-card,\n.template-3-card,\n.template-4-card {\n  box-sizing: border-box;\n  width: 100%;\n  height: 100%;\n}\n\n/* Template 1 styles */\n.template-1-card {\n  background: #f5f5f5;\n  text-align: center;\n  padding: 20px;\n}\n\n.template-1-card-header {\n  font-size: 24px;\n  margin-bottom: 10px;\n}\n\n.template-1-card-body {\n  font-size: 16px;\n}\n\n.card-footer1 {\n  background: #fff;\n  padding: 10px;\n  text-align: center;\n  border-top: 1px solid #ccc;\n}\n\n.top-right-button {\n  position: absolute;\n  top: 10px;\n  right: 10px;\n  background: #008cba;\n  color: white;\n  border: none;\n  padding: 10px;\n  font-size: 14px;\n  cursor: pointer;\n}\n\n.top-right-button:hover {\n  background-color: #005f5f;\n}\n\n/* Template 2 styles */\n.template-2-container-card {\n  display: flex;\n  height: 100%;\n}\n\n.template-2-left-container-card {\n  flex: 1;\n}\n\n.template-2-right-container-card {\n  flex: 1;\n  padding: 20px;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n}\n\n.template-2-text {\n  font-size: 18px;\n  text-align: center;\n}\n\n/* Template 3 styles */\n.template-3-card {\n  text-align: center;\n  padding: 20px;\n  background: #ffebcd;\n}\n\n.template-3-text {\n  margin-top: 10px;\n}\n\n.template-3-text h1 {\n  margin-bottom: 10px;\n}\n\n/* Template 4 styles */\n.template-4-card {\n  background: #e0f7fa;\n  padding: 20px;\n  box-shadow: 0px 4px 6px rgba(0,0,0,0.1);\n  text-align: center;\n}\n\n.template-4-card-content {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n}\n\n.template-4-card-header,\n.template-4-card-body,\n.template-4-card-footer {\n  padding: 10px;\n}\n\n/* Carousel control button styles */\nlyte-carousel-prev,\nlyte-carousel-next {\n  background-color: #008cba;\n  border: none;\n  color: white;\n  padding: 10px;\n  font-size: 18px;\n  cursor: pointer;\n  position: absolute;\n  top: 45%;\n  transform: translateY(-50%);\n}\n\nlyte-carousel-prev {\n  left: 10px;\n}\n\nlyte-carousel-next {\n  right: 10px;\n}\n\nlyte-carousel-prev:hover,\nlyte-carousel-next:hover {\n  background-color: #005f5f;\n}\n\n/* Carousel indicators styles */\nlyte-carousel-indicator {\n  position: absolute;\n  bottom: 10px;\n  left: 50%;\n  transform: translateX(-50%);\n  display: flex;\n  gap: 5px;\n}\n\nlyte-indicator-item {\n  width: 10px;\n  height: 10px;\n  background-color: #ccc;\n  border-radius: 50%;\n  cursor: pointer;\n}\n\nlyte-indicator-item[data-value=\"0\"].active,\nlyte-indicator-item[data-value=\"1\"].active,\nlyte-indicator-item[data-value=\"2\"].active,\nlyte-indicator-item[data-value=\"3\"].active {\n  background-color: #008cba;\n}\n/* Template 1 Styles */\n.template-1-card {\n  background-color: #fff;\n  border-radius: 15px;\n  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);\n  text-align: center;\n  width: 100%;\n  height: 100%;\n  padding: 20px;\n}\n\n.template-1-card-header {\n  background-color: #ff6f61;\n  color: #fff;\n  padding: 20px;\n  border-radius: 15px 15px 0 0;\n  font-size: 1.5em;\n}\n\n.template-1-card-body {\n  font-size: 1.2em;\n  color: #333;\n background-color:#fff4df;\n}\n\n.template-1-button {\n  background-color: #ff6f61;\n  color: #fff;\n  border: none;\n  border-radius: 5px;\n  padding: 10px 20px;\n  cursor: pointer;\n  font-size: 1em;\n  transition: background-color 0.3s ease;\n}\n\n.template-1-button:hover {\n  background-color: #e55a4e;\n}\n\n/* Template 2 Styles */\n.template-2-container-card {\n  display: flex;\n  flex-direction: row;\n  align-items: center;\n  width: 100%;\n  height: 100%;\n  /* Ensure full height */\n  background-color: #fff;\n  padding: 20px;\n  border-radius: 15px;\n  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);\n}\n\n.template-2-left-container-card {\n  width: 50%;\n  height: 100%;\n  border-radius: 10px;\n  overflow: hidden;\n}\n\n.template-2-left-container-card img {\n  width: 100%;\n  /* Ensure image fits the container */\n  height: 100%;\n  object-fit: cover;\n  /* Cover the entire area */\n}\n\n.template-2-right-container-card {\n  backdrop-filter: blur(25px);\n  background-color: rgba(255, 255, 255, 0.1);\n  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;\n  width: 50%;\n  height: 100%;\n  margin: 1vw;\n  border-radius: 10px;\n  text-align: center;\n}\n\n.template-2-text {\n  padding: 1em;\n  font-size: 1.2em;\n  color: #333;\n}\n\n/* Template 3 Styles */\n.template-3-card {\n  background: #12192c;\n  border-radius: 30px;\n  height: 100%;\n  /* Ensure full height */\n  width: 100%;\n  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);\n  text-align: center;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  align-items: center;\n  padding: 1em;\n  color: #DCE35B;\n}\n\n.template-3-text {\n  padding: 1em;\n  font-size: 1.5em;\n  color:#ccc;\n}\n\n.template-3-card img.birthday {\n  max-height: 200px;\n  object-fit: contain;\n  margin: auto;\n}\n\n.template-3-text h1 {\n  font-family: cursive;\n  font-size: 40px;\n  color:#ccc;\n}\n\n/* Template 4 Styles */\n.template-4-card {\n  background-image: url('https://source.unsplash.com/800x600/?birthday,party');\n  background-size: cover;\n  background-position: center;\n  border-radius: 20px;\n  width: 100%;\n  height: 100%;\n  /* Ensure full height */\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);\n  overflow: hidden;\n  position: relative;\n}\n\n.template-4-card::before {\n  content: '';\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  background: rgba(255, 255, 255, 0.8);\n}\n\n.template-4-card-content {\n  position: relative;\n  z-index: 1;\n  text-align: center;\n  padding: 20px;\n}\n\n.template-4-card-header {\n  color: #d72638;\n  margin-bottom: 15px;\n  font-size: 2em;\n}\n\n.template-4-card-header h1 {\n  font-size: 2.5em;\n  margin: 0;\n  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);\n}\n\n.template-4-card-body {\n  font-size: 1.2em;\n  color: #333;\n  margin-bottom: 20px;\n  line-height: 1.6;\n}\n\n.template-4-card-footer {\n  font-size: 1em;\n  color: #555;\n}\n\n.template-4-card-footer p {\n  margin: 5px 0;\n}\n\n/* General modal styles */\nlyte-modal {\n  position: fixed;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  width: 400px;\n  max-width: 90%;\n  background-color: #ffffff;\n  border-radius: 8px;\n  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);\n  padding: 20px;\n  z-index: 999;\n}\n\nlyte-modal-header {\n  font-size: 1.25rem;\n  font-weight: 600;\n  padding-bottom: 15px;\n  color: #333;\n  /* border-bottom: 1px solid #eaeaea; */\n}\n\nlyte-modal-content {\n  padding: 20px;\n  font-size: 1rem;\n  color: #555;\n}\n\nlyte-modal-footer {\n  padding: 15px 0;\n  text-align: right;\n  /* border-top: 1px solid #eaeaea; */\n}\n\n.mymodalinput lyte-input {\n  width: 300px;\n  padding: 10px;\n  font-size: 1rem;\n  /* border: 1px solid #ddd; */\n  border-radius: 5px;\n  box-sizing: border-box;\n  margin-bottom: 15px;\n}\n\n.mymodalinput lyte-input:focus {\n  border-color: #3498db;\n  outline: none;\n  box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);\n}\n\n.text-center {\n  text-align: center;\n}\n\n.text-center lyte-button {\n  margin: 10px 5px;\n}\n\n.text-center lyte-button[lt-prop-appearance=\"primary\"] {\n  background-color: #3498db;\n  border: none;\n  color: white;\n  padding: 10px 20px;\n  font-size: 1rem;\n  border-radius: 5px;\n  cursor: pointer;\n  transition: background-color 0.3s ease;\n}\n\n.text-center lyte-button[lt-prop-appearance=\"primary\"]:hover {\n  background-color: #2980b9;\n}\n\n.text-center lyte-button {\n  background-color: #e0e0e0;\n  border: none;\n  color: #333;\n  padding: 10px 20px;\n  font-size: 1rem;\n  border-radius: 5px;\n  cursor: pointer;\n  transition: background-color 0.3s ease;\n}\n\n.text-center lyte-button:hover {\n  background-color: #d5d5d5;\n}\n\n/* Delete Reminder Modal specific styles */\nlyte-modal#deleteReminderModal p {\n  font-size: 1.1rem;\n  color: #444;\n  padding: 15px 0;\n  text-align: center;\n}\n\nlyte-modal#deleteReminderModal lyte-button[lt-prop-appearance=\"primary\"] {\n  background-color: #e74c3c;\n}\n\nlyte-modal#deleteReminderModal lyte-button[lt-prop-appearance=\"primary\"]:hover {\n  background-color: #c0392b;\n}\n\n/* Modal close button styles */\nlyte-modal-footer lyte-button,\nlyte-modal-header lyte-button {\n  margin: 0 10px;\n}\n\n/* Modal transitions */\nlyte-modal {\n  opacity: 0;\n  transition: opacity 0.4s ease;\n}\n\nlyte-modal.show {\n  opacity: 1;\n}\n\n/* Styling for the note paragraph */\n.note {\n  font-size: 14px;                /* Smaller font size for subtlety */\n  font-style: italic;             /* Italic to differentiate the note */\n  color: #6c757d;                 /* Light grey color for soft emphasis */\n  background-color: #f8f9fa;      /* Light background for better readability */\n  padding: 10px 15px;             /* Add some padding for spacing */\n  border-left: 4px solid #007bff; /* Left border to highlight the note */\n  border-radius: 4px;             /* Rounded corners for a polished look */\n  margin: 15px 0;       \n  top: 50%;\n  left: 50%;          \n  text-align: center;\n}\n</style>";;
BirthdayReminder._dynamicNodes = [{"t":"a","p":[3,3]},{"t":"a","p":[3,7,1,1]},{"t":"cD","p":[3,7,1,1],"in":15,"sibl":[14]},{"t":"a","p":[3,7,3,1]},{"t":"cD","p":[3,7,3,1],"in":14,"sibl":[13]},{"t":"a","p":[3,9,1,1]},{"t":"cD","p":[3,9,1,1],"in":13,"sibl":[12]},{"t":"a","p":[3,9,3,1]},{"t":"cD","p":[3,9,3,1],"in":12,"sibl":[11]},{"t":"a","p":[3,15]},{"t":"r","p":[3,15,1],"dN":[{"t":"cD","p":[1],"in":11,"sibl":[10]},{"t":"tX","p":[3,1,1,1,1]},{"t":"tX","p":[3,1,1,3,3,0]},{"t":"cD","p":[3,1],"in":10,"sibl":[9]},{"t":"tX","p":[3,3,1,3,1,7]},{"t":"tX","p":[3,3,1,3,1,11]},{"t":"cD","p":[3,3],"in":9,"sibl":[8]},{"t":"tX","p":[3,5,1,3,1,1]},{"t":"tX","p":[3,5,1,3,3,0]},{"t":"cD","p":[3,5],"in":8,"sibl":[7]},{"t":"tX","p":[3,7,1,1,3,1,1]},{"t":"tX","p":[3,7,1,1,3,3,0]},{"t":"cD","p":[3,7],"in":7,"sibl":[6]},{"t":"cD","p":[3,9,1],"in":6,"sibl":[5]},{"t":"cD","p":[3,9,3],"in":5,"sibl":[4]},{"t":"cD","p":[3,9,5],"in":4,"sibl":[3]},{"t":"cD","p":[3,9,7],"in":3,"sibl":[2]},{"t":"cD","p":[3,9],"in":2,"sibl":[1]},{"t":"cD","p":[3],"in":1,"sibl":[0]},{"t":"cD","p":[7],"in":0}],"dc":[11,10,9,8,7,6,5,4,3,2,1,0],"hc":true,"trans":true,"in":11,"sibl":[10]},{"t":"cD","p":[3,15],"in":10,"sibl":[9]},{"t":"a","p":[3,17,1,1]},{"t":"r","p":[3,17,1,1,1],"dN":[],"in":9,"sibl":[8]},{"t":"cD","p":[3,17,1,1],"in":8,"sibl":[7]},{"t":"r","p":[3,19,1],"dN":[{"t":"a","p":[1,1,1,1]},{"t":"f","p":[1,1,1,1],"dN":[],"in":5,"sibl":[4]},{"t":"cD","p":[1,1,1],"in":4,"sibl":[3]},{"t":"cD","p":[1,1],"in":3,"sibl":[2]},{"t":"a","p":[1,3,1]},{"t":"f","p":[1,3,1],"dN":[{"t":"a","p":[1,1]},{"t":"f","p":[1,1],"dN":[],"in":3,"sibl":[2]},{"t":"tX","p":[1,3,1,1,1,0]},{"t":"tX","p":[1,3,1,1,3,0]},{"t":"tX","p":[1,3,1,1,5,0]},{"t":"tX","p":[1,3,1,1,7,0]},{"t":"a","p":[1,3,1,3,1]},{"t":"cD","p":[1,3,1,3,1],"in":2,"sibl":[1]},{"t":"a","p":[1,3,1,3,3,1]},{"t":"a","p":[1,3,1,3,3,3]},{"t":"cD","p":[1,3],"in":1,"sibl":[0]},{"t":"cD","p":[1],"in":0}],"dc":[2,1,0],"hc":true,"trans":true,"in":2,"sibl":[1]},{"t":"cD","p":[1,3],"in":1,"sibl":[0]},{"t":"cD","p":[1],"in":0}],"dc":[4,3,2,1,0],"hc":true,"trans":true,"in":7,"sibl":[6]},{"t":"cD","p":[3,19],"in":6,"sibl":[5]},{"t":"r","p":[5,1],"dN":[{"t":"cD","p":[1],"in":9,"sibl":[8]},{"t":"a","p":[3,1]},{"t":"a","p":[3,1,1]},{"t":"a","p":[3,1,3,1,1,3,1]},{"t":"cD","p":[3,1,3,1,1,3,1],"in":8,"sibl":[7]},{"t":"a","p":[3,1,3,1,3,3,1]},{"t":"cD","p":[3,1,3,1,3,3,1],"in":7,"sibl":[6]},{"t":"a","p":[3,1,3,1,5,3,1]},{"t":"cD","p":[3,1,3,1,5,3,1],"in":6,"sibl":[5]},{"t":"a","p":[3,1,3,1,7,3,1]},{"t":"cD","p":[3,1,3,1,7,3,1],"in":5,"sibl":[4]},{"t":"a","p":[3,1,5,1]},{"t":"r","p":[3,1,5,1,1],"dN":[],"in":4,"sibl":[3]},{"t":"cD","p":[3,1,5,1],"in":3,"sibl":[2]},{"t":"a","p":[3,1,5,3]},{"t":"r","p":[3,1,5,3,1],"dN":[],"in":2,"sibl":[1]},{"t":"cD","p":[3,1,5,3],"in":1,"sibl":[0]},{"t":"cD","p":[3],"in":0}],"dc":[9,8,7,6,5,3,1,0],"hc":true,"trans":true,"in":5,"sibl":[4]},{"t":"cD","p":[5],"in":4,"sibl":[3]},{"t":"r","p":[7,1],"dN":[{"t":"cD","p":[1],"in":5,"sibl":[4]},{"t":"a","p":[5,1]},{"t":"r","p":[5,1,1],"dN":[],"in":4,"sibl":[3]},{"t":"cD","p":[5,1],"in":3,"sibl":[2]},{"t":"a","p":[5,3]},{"t":"r","p":[5,3,1],"dN":[],"in":2,"sibl":[1]},{"t":"cD","p":[5,3],"in":1,"sibl":[0]},{"t":"cD","p":[5],"in":0}],"dc":[5,3,1,0],"hc":true,"trans":true,"in":3,"sibl":[2]},{"t":"cD","p":[7],"in":2,"sibl":[1]},{"t":"r","p":[9,1],"dN":[{"t":"cD","p":[1],"in":1,"sibl":[0]},{"t":"a","p":[5]},{"t":"a","p":[7]},{"t":"cD","p":[10],"in":0}],"dc":[1,0],"hc":true,"trans":true,"in":1,"sibl":[0]},{"t":"cD","p":[9],"in":0},{"type":"dc","trans":true,"hc":true,"p":[15,14,13,12,11,10,8,7,6,5,4,3,2,1,0]}];;

BirthdayReminder._observedAttributes = [
    "headerJSON",
    "reminders",
    "name",
    "message",
    "email",
    "birthday",
    "template",
    "editReminder",
    "deleteRemind",
    "isEditModalVisible",
    "isDeleteModalVisible",
    "isSignOutModalVisible",
    "maxDate",
    "selectedButton",
    "selectTemplate",
    "userName",
    "userId",
    "userType"
];

export { BirthdayReminder };

BirthdayReminder.register("birthday-reminder", {
    hash: "BirthdayReminder_4",
    refHash: "C_birthday-reminder_app_0"
});
