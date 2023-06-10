/*****************************************************************************************
 Get all options from an element
/*****************************************************************************************/
function getAllElementOptions(element_to_process, elemet_type, element_value) {
    const form_element_object = document.getElementById(element_to_process)
    var option_list = []
    if (elemet_type !== 'checkbox') {
        for (const option of form_element_object.options) {
            //                console.log("LABEL: " + option.label); // "Option 1" and "Option 2"
            option_list.push(option.label)
        }
    }

    if (elemet_type === 'checkbox' && element_value === 'checked') {
        option_list.push('checked')
    }

    if (elemet_type === 'checkbox' && element_value !== 'checked') {
        option_list.push(null)
    }

    return option_list
}
/*****************************************************************************************/

/*****************************************************************************************
 Get all of the elements from the settings form
/*****************************************************************************************/
function getCurrentlySavedSettings() {
    var form_elements = document.getElementById("wla_list_users_settings_form").elements

    var settings_table_objects = []

    Object.entries(form_elements).forEach(form_element_array => {
        var form_element_id = form_element_array[0]
        //        console.log(`FORM ELEMENT ID:\n${form_element_id}`)

        if (form_element_id.includes('wla_list_users_settings')) {
            var saved_form_element_value = getKey(form_element_id)
            //            console.log(`SAVED FORM ELEMENT VALUE:\n${saved_form_element_value}`)
            var saved_form_element_type = document.getElementById(form_element_id).type
            //console.log(`FORM ELEMENT TYPE: ${saved_form_element_type}`)

            if (saved_form_element_type !== 'checkbox') {
                document.getElementById(form_element_id).value = saved_form_element_value
            }

            if (saved_form_element_type === 'checkbox' && saved_form_element_value === 'true') {
                document.getElementById(form_element_id).checked = true
            }

            if (saved_form_element_type === 'checkbox' && saved_form_element_value === 'false') {
                document.getElementById(form_element_id).checked = false
            }

            var form_element_options = getAllElementOptions(form_element_id, saved_form_element_type, saved_form_element_value)

            var form_element_settings_object = {
                form_element_id: form_element_id,
                form_element_value: saved_form_element_value,
                form_element_options: form_element_options
            } // END OBJECT

            settings_table_objects.push(form_element_settings_object)

            //            console.log("SETTINGS TABLE OBJECTS:\n" + JSON.stringify(settings_table_objects, null, '\t'))

        } // END IF


    }); // END Object.entries






    /*****************************************************************************************
     * CREATE TABLE OBJECT
     /*****************************************************************************************
    window.addEventListener("load", function () {
        var table = new Tabulator("#wla_list_users_settings_table", {
            data: settings_table_objects,
            height: "80%",
            //            autoColumns: true,
            columns: { title: settings_table_objects[] },
            layout: "fitColumns",
            pagination: true,
            paginationSize: 25,
            paginationSizeSelector: [10, 25, 50, 100, true] //select list with an "all" option at the end of the list
        })
    })
    /*****************************************************************************************/
} // END FUNCTION

/*****************************************************************************************
 Get all of the elements from the settings form
/*****************************************************************************************/
function saveSettings() {

    var form_elements = document.getElementById("wla_list_users_settings_form").elements

    Object.entries(form_elements).forEach(form_element_array => {
        var form_element_id = form_element_array[0]
        if (form_element_id.includes('wla_list_users_settings')) {
            var form_element_value = document.getElementById(form_element_id).value
            var form_element_type = document.getElementById(form_element_id).type


            if (form_element_type === 'checkbox') {
                form_element_value = document.getElementById(form_element_id).checked
                //                console.log(`ELEMENT ID: ${form_element_id}`)
                //                console.log(`ELEMENT VALUE: ${form_element_value}`)
                //form_element_value = 'checked'
            }

            setKey(form_element_id, form_element_value)
        }
    });

    goBack()
}

/*****************************************************************************************
 Go back to main List Users page
/*****************************************************************************************/
function goBack() {
    history.back()
}
