/*****************************************************************************************/
var client = ZAFClient.init();
var zd_metadata = ''
const DateTime = luxon.DateTime;
/*****************************************************************************************/

/*****************************************************************************************/
var counter = 0
var zd_url_objects_counter = 0
var zd_domain = ''
/*****************************************************************************************/

/*****************************************************************************************/
var css = "background: #444; color: #bada55; padding: 2px; border-radius:2px;'";
/*****************************************************************************************/

/*****************************************************************************************
countProperties()
*****************************************************************************************/
function countProperties(obj) {
	var prop_count = 0;

	for (var prop in obj) {
		if (obj.hasOwnProperty(prop))
			++prop_count;
	}

	return prop_count;
}
/******************************************************************************************/

/*****************************************************************************************
getData()
*****************************************************************************************/
async function getData(zd_url, zd_json_key) {
	var zd_url_objects_counter = 0
	zd_complete_data_array = []
	/*****************************************************************************************/
	while (zd_url) {

		/*****************************************************************************************/
		/******************************************************************************************/
		const zd_url_settings = {
			url: `${zd_url}`,
			type: "GET",
			dataType: "json",
			httpCompleteResponse: true
		}

		const zd_url_response = await client.request(zd_url_settings);

		/*****************************************************************************************/

		/*****************************************************************************************/
		const zd_url_response_json = zd_url_response.responseJSON
		const zd_url_response_text = zd_url_response.responseText
		const zd_url_objects = zd_url_response_json[zd_json_key]
		/*****************************************************************************************/

		/*****************************************************************************************/
		Object.entries(zd_url_objects).forEach(zd_url_object => {
			const [key, value] = zd_url_objects;
			var zd_url_single_object = []
			zd_url_single_object.push(zd_url_object[1])
			zd_complete_data_array.push(zd_url_single_object)
			zd_url_objects_counter++
		});
		/*****************************************************************************************/

		/*****************************************************************************************
		 * GET THE URL OF THE NEXT PAGE OF DATA
		/*****************************************************************************************/
		if ('links' in zd_url_response_json) {
			zd_url = zd_url_response_json['links']['next']
		}
		else {
			zd_url = zd_url_response_json['next_page']
		}
		/*****************************************************************************************/

		/*****************************************************************************************/
	} // END WHILE url LOOP
	/*****************************************************************************************/

	return zd_complete_data_array

} // END getData(url, key)
/***************************************************************************************** /

/*****************************************************************************************
 * processUserOrganizations(zd_user)
 *****************************************************************************************/
function processUserOrganizations(user_organizations) {

	var user_organizations_array = []
	Object.entries(user_organizations).forEach(user_organization => {
		var processed_user_organization = user_organization[1]
		var user_organization_name = processed_user_organization[0]['name']
		user_organizations_array.push(user_organization_name)
	})

	user_organizations_array.sort()
	var user_organizations_string = user_organizations_array.join()

	return user_organizations_string
}

/*****************************************************************************************
 * processUserGroups(user_groups)
 *****************************************************************************************/
function processUserGroups(user_groups) {

	var user_groups_array = []
	Object.entries(user_groups).forEach(user_group => {
		var processed_user_group = user_group[1]
		var user_group_name = processed_user_group[0]['name']

		user_groups_array.push(user_group_name)
	})

	user_groups_array.sort()
	var user_groups_string = user_groups_array.join()

	return user_groups_string

}

/*****************************************************************************************
 * getDefaultUserGroupName(user_groups)
 *****************************************************************************************/
function getDefaultUserGroupName(user_groups, user_default_group_id) {

	var user_default_group_name = ''

	Object.entries(user_groups).forEach(user_group => {
		var processed_user_group = user_group[1][0]

		if (processed_user_group['default'] === true) {
			user_default_group_name = processed_user_group['name']
		}

		if (processed_user_group['id'] === user_default_group_id) {
			user_default_group_name = processed_user_group['name']
		}

	})

	return user_default_group_name
}


/*****************************************************************************************
 * processUserObjects(array_of_user_objects)
 *****************************************************************************************/
async function processUserObjects(array_of_user_objects) {
	var all_users = []

	for (let user_object_counter = 0; user_object_counter < array_of_user_objects.length; user_object_counter++) {

		var user_object = array_of_user_objects[user_object_counter][0]

		/*****************************************************************************************
		THE BELOW CODE UPDATES THE USER OBJECT WITH DATA, AND DATA FORMATS, THAT WE WANT TO DISPLAY
		IN OUR TABLE.
		*****************************************************************************************/
		user_object['organization_names'] = ''
		user_object['tags'] = user_object['tags'].sort()
		user_object['tags'] = user_object['tags'].join()
		user_object['role'] = user_object['role'].replace(/^./, str => str.toUpperCase())
		user_object['agent_url'] = 'https://' + zd_domain + '.zendesk.com/agent/users/' + user_object['id']

		if (user_object['organization_id']) {
			var user_organization_endpoint = `/api/v2/users/${user_object['id']}/organizations.json`
			var user_organizations = await getData(user_organization_endpoint, 'organizations')
			user_object['organization_names'] = processUserOrganizations(user_organizations)
			//			user_object['organization_names'].sort()
		}

		if (user_object['role'] !== 'End-user') {
			var user_groups_endpoint = `/api/v2/users/${user_object['id']}/groups`
			var user_groups = await getData(user_groups_endpoint, 'groups')
			var user_default_group_id = user_object['default_group_id']
			user_object['default_group_name'] = getDefaultUserGroupName(user_groups, user_default_group_id)
			user_object['user_groups'] = processUserGroups(user_groups)
			//			console.log("TYPE: " + typeof (user_object['user_groups'].join()))
			//			console.log("MEH: \n" + JSON.stringify(user_object['user_groups'].join(), null, '\t'))
		}

		if (user_object['last_login_at']) {
			var dt = DateTime.fromISO(user_object['last_login_at'])
			user_object['last_login_at_date'] = dt.toLocaleString(DateTime.DATE_SHORT)
			user_object['last_login_at_time'] = dt.toLocaleString(DateTime.TIME_24_SIMPLE)
		}

		if (user_object['created_at']) {
			var dt = DateTime.fromISO(user_object['created_at'])
			user_object['created_at_date'] = dt.toLocaleString(DateTime.DATE_SHORT)
			user_object['created_at_time'] = dt.toLocaleString(DateTime.TIME_24_SIMPLE)
		}

		if (user_object['updated_at']) {
			var dt = DateTime.fromISO(user_object['updated_at'])
			user_object['updated_at_date'] = dt.toLocaleString(DateTime.DATE_SHORT)
			user_object['updated_at_time'] = dt.toLocaleString(DateTime.TIME_24_SIMPLE)
		}

		/*****************************************************************************************/

		all_users.push(user_object)
	} // END FOR LOOP
	/*****************************************************************************************/
	all_users.sort((a, b) => (a.role > b.role) ? 1 : -1);
	return all_users

} // END OF processUserObjects()

/*****************************************************************************************
 * MAIN
 *****************************************************************************************/
const main = async () => {


	zd_metadata = await client.metadata()
	sessionStorage.setItem("wla_list_users_install_id", zd_metadata.installationId)
	//	console.log(`zd_metadata: ${zd_metadata.installationId}`)

	/*****************************************************************************************
	 * USE LOCAL STORAGE TO SET OR GET zd_domain
	/*****************************************************************************************/
	if (getKey("zd_domain", zd_domain) === null) {
		zd_client_context = await client.context()
		zd_domain = zd_client_context.account.subdomain
		setKey("zd_domain", zd_domain)
	}
	else {
		zd_domain = getKey("zd_domain")
	}

	/*****************************************************************************************/

	// THE BELLOW IS A TEST TO ENSURE THAT THE getData FUNCTION WORKS WITH OTHER ENDPOINT URLS
	//var array_of_organization_objects = await getData('/api/v2/organizations', 'organizations')

	var array_of_user_objects = await getData('/api/v2/users?page[size]=100', 'users')
	var processed_array_of_user_objects = await processUserObjects(array_of_user_objects)

	console.log("TOTAL NUMBER OF USERS: " + processed_array_of_user_objects.length)

	/*****************************************************************************************/
	//Define variables for input elements
	/*****************************************************************************************/
	var fieldEl = document.getElementById("filter-field");
	var typeEl = document.getElementById("filter-type");
	var valueEl = document.getElementById("filter-value");
	/*****************************************************************************************/

	/*****************************************************************************************/
	//Custom filter example
	/*****************************************************************************************/
	function customFilter(data) {
		return data.car && data.rating < 3;
	}
	/*****************************************************************************************/

	/*****************************************************************************************/
	//Trigger setFilter function with correct parameters
	/*****************************************************************************************/
	function updateFilter() {

		/*****************************************************************************************/
		var filterVal = fieldEl.options[fieldEl.selectedIndex].value;
		var typeVal = typeEl.options[typeEl.selectedIndex].value;
		var filter = filterVal == "function" ? customFilter : filterVal;
		/*****************************************************************************************/

		/*****************************************************************************************/
		if (filterVal == "function") {
			typeEl.disabled = true;
			valueEl.disabled = true;
		} else {
			typeEl.disabled = false;
			valueEl.disabled = false;
		}
		/*****************************************************************************************/

		/*****************************************************************************************/
		if (filterVal) {
			table.setFilter(filter, typeVal, valueEl.value);
		}
		/*****************************************************************************************/
		/*****************************************************************************************/
	} // END updateFilter FUNCTION
	/*****************************************************************************************/

	/*****************************************************************************************/
	//Update filters on value change
	/*****************************************************************************************/
	document.getElementById("filter-field").addEventListener("change", updateFilter);
	document.getElementById("filter-type").addEventListener("change", updateFilter);
	document.getElementById("filter-value").addEventListener("keyup", updateFilter);
	/*****************************************************************************************/

	/*****************************************************************************************/
	//Clear filters on "Clear Filters" button click
	/*****************************************************************************************/
	document.getElementById("filter-clear").addEventListener("click", function () {
		fieldEl.value = "";
		typeEl.value = "=";
		valueEl.value = "";

		table.clearFilter();
	});
	/*****************************************************************************************/

	/*****************************************************************************************/

	/*****************************************************************************************
	 * LOOK UP CONFIG DATA FROM LOCAL STORAGE
	/*****************************************************************************************/
	var group_by_key = getKey("wla_list_users_settings_group_users_by_field_value")
	var sort_by_key = getKey("wla_list_users_settings_sort_users_by_field_value")
	var link_names_value = getKey("wla_list_users_settings_make_username_url_value")
	var link_emails_value = getKey("wla_list_users_settings_make_user_emails_url_value")
	var include_user_id = getKey("wla_list_users_settings_include_user_id")
	var include_user_url = getKey("wla_list_users_settings_include_user_url")
	var include_user_name = getKey("wla_list_users_settings_include_user_name")
	var include_user_role = getKey("wla_list_users_settings_include_user_role")
	var include_user_email = getKey("wla_list_users_settings_include_user_email")
	var include_user_created_at_date = getKey("wla_list_users_settings_include_user_created_at_date")
	var include_user_created_at_time = getKey("wla_list_users_settings_include_user_created_at_time")
	var include_user_created_at_raw = getKey("wla_list_users_settings_include_user_created_at_raw")
	var include_user_updated_at_date = getKey("wla_list_users_settings_include_user_updated_at_date")
	var include_user_updated_at_time = getKey("wla_list_users_settings_include_user_updated_at_time")
	var include_user_updated_at_raw = getKey("wla_list_users_settings_include_user_updated_at_raw")
	var include_user_timezone = getKey("wla_list_users_settings_include_user_timezone")
	var include_user_iana_timezone = getKey("wla_list_users_settings_include_user_iana_timezone")
	var include_user_phone = getKey("wla_list_users_settings_include_user_phone")
	var include_user_shared_phone = getKey("wla_list_users_settings_include_user_shared_phone")
	//var include_user_photo = getKey("wla_list_users_settings_include_user_photo")
	var include_user_locale_id = getKey("wla_list_users_settings_include_user_locale_id")
	var include_user_locale = getKey("wla_list_users_settings_include_user_locale")
	var include_user_email_verified_status = getKey("wla_list_users_settings_include_user_email_verified_status")
	var include_user_external_id = getKey("wla_list_users_settings_include_user_external_id")
	var include_user_tags = getKey("wla_list_users_settings_include_user_tags")
	var include_user_alias = getKey("wla_list_users_settings_include_user_alias")
	var include_user_active = getKey("wla_list_users_settings_include_user_active")
	var include_user_shared = getKey("wla_list_users_settings_include_user_shared")
	var include_user_shared_agent = getKey("wla_list_users_settings_include_user_shared_agent")
	var include_user_last_login_at_date = getKey("wla_list_users_settings_include_user_last_login_at_date")
	var include_user_last_login_at_time = getKey("wla_list_users_settings_include_user_last_login_at_time")
	var include_user_last_login_at_raw = getKey("wla_list_users_settings_include_user_last_login_at_raw")
	var include_user_two_factor_auth_enabled = getKey("wla_list_users_settings_include_user_two_factor_auth_enabled")
	var include_user_signature = getKey("wla_list_users_settings_include_user_signature")
	var include_user_details = getKey("wla_list_users_settings_include_user_details")
	var include_user_notes = getKey("wla_list_users_settings_include_user_notes")
	var include_user_custom_role_id = getKey("wla_list_users_settings_include_user_custom_role_id")
	var include_user_moderator = getKey("wla_list_users_settings_include_user_moderator")
	var include_user_ticket_restriction = getKey("wla_list_users_settings_include_user_ticket_restriction")
	var include_user_only_private_comments = getKey("wla_list_users_settings_include_user_only_private_comments")
	var include_user_restricted_agent = getKey("wla_list_users_settings_include_user_restricted_agent")
	var include_user_suspended = getKey("wla_list_users_settings_include_user_suspended")
	var include_user_default_group_name = getKey("wla_list_users_settings_include_user_default_group_name")
	var include_user_default_group_id = getKey("wla_list_users_settings_include_user_default_group_id")
	var include_user_groups = getKey("wla_list_users_settings_include_user_groups")
	var include_user_report_csv = getKey("wla_list_users_settings_include_user_report_csv")
	var include_user_organizations = getKey("wla_list_users_settings_include_user_organizations")



	// https://www.aspsnippets.com/Articles/Add-Insert-Items-Options-to-DropDownList-on-Button-click-using-JavaScript.aspx

	if (sort_by_key === '') {
		sort_by_key = 'name'
	}

	var table_columns_object = []

	/* WE WERE TRYING TO SEE IF WE COULD GET THE ROWS TO BE TOGGLE WITH A CHECKBOX:
	https://tabulator.info/examples/4.6#selectable-tick
	*/
	//var first_column_object = { formatter: "rowSelection", titleFormatter: "rowSelection", hozAlign: "center", headerSort: false, cellClick: function (e, cell) { cell.getRow().toggleSelect(); } }
	var first_column_object = { formatter: "rowSelection", titleFormatter: "rowSelection", headerSort: false, cellClick: function (e, cell) { cell.getRow().toggleSelect(); } }
	table_columns_object.push(first_column_object)


	/*****************************************************************************************
	 * CREATE USER COLUMN
	/*****************************************************************************************/

	/*****************************************************************************************
	 * USER NAME COLUMN OBJECT
	/*****************************************************************************************/
	if (include_user_name === 'true') {

		/*****************************************************************************************/
		if (link_names_value === 'Yes') {
			var user_name_column_object = {
				title: "Name", field: "name", formatter: "link", formatterParams: {
					labelField: "name",
					urlField: "agent_url",
					target: "_blank"
				}
			}
			table_columns_object.push(user_name_column_object)
		}
		/*****************************************************************************************/

		/*****************************************************************************************/
		if (link_names_value !== 'Yes') {
			var user_name_column_object = { title: "Name", field: "name" }
			table_columns_object.push(user_name_column_object)
		}
		/*****************************************************************************************/

	} // END include_user_name IF STATEMENT
	/*****************************************************************************************/

	/*****************************************************************************************
	 * USER ID COLUMN OBJECT
	/*****************************************************************************************/
	if (include_user_id === 'true') {
		var user_id_column_object = { title: "User ID", field: "id" }
		table_columns_object.push(user_id_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	 * USER URL COLUMN OBJECT
	/*****************************************************************************************/
	if (include_user_url === 'true') {
		var user_url_column_object = { title: "User URL", field: "url" }
		table_columns_object.push(user_url_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	 * USER EMAIL COLUMN OBJECT
	/*****************************************************************************************/
	if (link_emails_value === 'Yes') {
		if (include_user_email === 'true') {
			var user_email_column_object = {
				title: "Email", field: "email", formatter: "link", formatterParams: {
					labelField: "email",
					urlPrefix: "mailto://",
					target: "_blank"
				}
			}
			table_columns_object.push(user_email_column_object)
		}
	}

	if (link_emails_value !== 'Yes') {
		if (include_user_email === 'true') {
			var user_email_column_object = { title: "Email", field: "email" }
			table_columns_object.push(user_email_column_object)
		}
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	 * USER ROLE COLUMN OBJECT
	/*****************************************************************************************/
	if (include_user_role === 'true') {
		var user_role_column_object = { title: "Role", field: "role", sorter: "string", sorterParams: { locale: true, alignEmptyValues: "top" } }
		table_columns_object.push(user_role_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	 * USER CREATED AT DATE
	/*****************************************************************************************/
	if (include_user_created_at_date === 'true') {
		var user_created_at_date_column_object = { title: "Created At Date", field: "created_at_date" }
		table_columns_object.push(user_created_at_date_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	 * USER CREATED AT TIME
	/*****************************************************************************************/
	if (include_user_created_at_time === 'true') {
		var user_created_at_time_column_object = { title: "Created At Time", field: "created_at_time" }
		table_columns_object.push(user_created_at_time_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	 * USER CREATED AT (RAW)
	/*****************************************************************************************/
	if (include_user_created_at_raw === 'true') {
		var user_created_at_raw_column_object = { title: "Created At Time (RAW)", field: "created_at" }
		table_columns_object.push(user_created_at_raw_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	 * USER UPDATED AT DATE
	/*****************************************************************************************/
	if (include_user_updated_at_date === 'true') {
		var user_updated_at_date_column_object = { title: "Updated At Date", field: "updated_at_date" }
		table_columns_object.push(user_updated_at_date_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	 * USER UPDATED AT TIME
	/*****************************************************************************************/
	if (include_user_updated_at_time === 'true') {
		var user_updated_at_time_column_object = { title: "Updated At Time", field: "updated_at_time" }
		table_columns_object.push(user_updated_at_time_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	 * USER UPDATED AT (RAW)
	/*****************************************************************************************/
	if (include_user_updated_at_raw === 'true') {
		var user_updated_at_raw_column_object = { title: "Updated At Time (RAW)", field: "updated_at" }
		table_columns_object.push(user_updated_at_raw_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	 * USER TIME ZONE
	/*****************************************************************************************/
	if (include_user_timezone === 'true') {
		var user_timezone_column_object = { title: "Time Zone", field: "time_zone" }
		table_columns_object.push(user_timezone_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	 * USER TIME IANA ZONE
	/*****************************************************************************************/
	if (include_user_iana_timezone === 'true') {
		var user_iana_timezone_column_object = { title: "IANA Time Zone", field: "iana_time_zone" }
		table_columns_object.push(user_iana_timezone_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	 * USER PHONE
	/*****************************************************************************************/
	if (include_user_phone === 'true') {
		var user_phone_column_object = { title: "Phone", field: "phone" }
		table_columns_object.push(user_phone_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	 * USER SHARED PHONE
	/*****************************************************************************************/
	if (include_user_shared_phone === 'true') {
		var user_shared_phone_column_object = { title: "Shared Phone", field: "shared_phone_number" }
		table_columns_object.push(user_shared_phone_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	  * USER PHOTO
	/*****************************************************************************************
	if (include_user_photo === 'true') {
		var user_photo_column_object = { title: "Photo", field: "photo" }
		table_columns_object.push(user_photo_column_object)
	}
	*****************************************************************************************/

	/*****************************************************************************************
	  * USER LOCALE ID
	/*****************************************************************************************/
	if (include_user_locale_id === 'true') {
		var user_locale_id_column_object = { title: "Locale ID", field: "locale_id" }
		table_columns_object.push(user_locale_id_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	  * USER LOCALE
	/*****************************************************************************************/
	if (include_user_locale === 'true') {
		var user_locale_column_object = { title: "Locale", field: "locale" }
		table_columns_object.push(user_locale_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	  * USER EMAIL VERIFIED STATUS
	/*****************************************************************************************/
	if (include_user_email_verified_status === 'true') {
		var user_email_verified_status_column_object = { title: "Email Verification Status", field: "verified" }
		table_columns_object.push(user_email_verified_status_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	  * USER EXTERNAL ID
	/*****************************************************************************************/
	if (include_user_external_id === 'true') {
		var user_external_id_column_object = { title: "External ID", field: "external_id" }
		table_columns_object.push(user_external_id_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	  * USER TAGS
	/*****************************************************************************************/
	if (include_user_tags === 'true') {
		var user_tags_column_object = { title: "Tags", field: "tags", headerSort: false }
		table_columns_object.push(user_tags_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
		* USER ALIAS
	/*****************************************************************************************/
	if (include_user_alias === 'true') {
		var user_alias_column_object = { title: "Alias", field: "alias" }
		table_columns_object.push(user_alias_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	* USER ACTIVE
	/*****************************************************************************************/
	if (include_user_active === 'true') {
		var user_active_column_object = { title: "Active User", field: "active" }
		table_columns_object.push(user_active_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	* USER SHARED
	/*****************************************************************************************/
	if (include_user_shared === 'true') {
		var user_shared_column_object = { title: "Shared User", field: "shared" }
		table_columns_object.push(user_shared_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	* USER SHARED AGENT
	/*****************************************************************************************/
	if (include_user_shared_agent === 'true') {
		var user_shared_agent_column_object = { title: "Shared Agent", field: "shared_agent" }
		table_columns_object.push(user_shared_agent_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	* USER LAST LOGIN AT DATE
	/*****************************************************************************************/
	if (include_user_last_login_at_date === 'true') {
		var user_last_login_at_date_column_object = { title: "Last Login Date", field: "last_login_at_date" }
		table_columns_object.push(user_last_login_at_date_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	* USER LAST LOGIN AT TIME
	/*****************************************************************************************/
	if (include_user_last_login_at_time === 'true') {
		var user_last_login_at_time_column_object = { title: "Last Login Time", field: "last_login_at_time" }
		table_columns_object.push(user_last_login_at_time_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	* USER LAST LOGIN (RAW)
	/*****************************************************************************************/
	if (include_user_last_login_at_raw === 'true') {
		var user_last_login_at_raw_column_object = { title: "Last Login (RAW)", field: "last_login_at" }
		table_columns_object.push(user_last_login_at_raw_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	* USER 2FA STATUS
	/*****************************************************************************************/
	if (include_user_two_factor_auth_enabled === 'true') {
		var user_two_factor_auth_enabled_column_object = { title: "2FA Status", field: "two_factor_auth_enabled" }
		table_columns_object.push(user_two_factor_auth_enabled_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	* USER SIGNATURE
	/*****************************************************************************************/
	if (include_user_signature === 'true') {
		var user_signature_column_object = { title: "Signature", field: "signature" }
		table_columns_object.push(user_signature_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	* USER DETAILS
	/*****************************************************************************************/
	if (include_user_details === 'true') {
		var user_details_column_object = { title: "Details", field: "details" }
		table_columns_object.push(user_details_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	* USER NOTES
	/*****************************************************************************************/
	if (include_user_notes === 'true') {
		var user_notes_column_object = { title: "Notes", field: "notes" }
		table_columns_object.push(user_notes_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	* USER CUSTOM ROLE ID
	/*****************************************************************************************/
	if (include_user_custom_role_id === 'true') {
		var user_custom_role_id_column_object = { title: "Custom Role ID", field: "custom_role_id" }
		table_columns_object.push(user_custom_role_id_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	* USER MODERATOR
	/*****************************************************************************************/
	if (include_user_moderator === 'true') {
		var user_moderator_column_object = { title: "Moderator", field: "moderator" }
		table_columns_object.push(user_moderator_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	* USER TICKET RESTRICTION
	/*****************************************************************************************/
	if (include_user_ticket_restriction === 'true') {
		var user_ticket_restriction_column_object = { title: "Ticket Restriction", field: "ticket_restriction" }
		table_columns_object.push(user_ticket_restriction_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	* USER PRIVATE COMMENTS
	/*****************************************************************************************/
	if (include_user_only_private_comments === 'true') {
		var user_only_private_comments_column_object = { title: "Only Private Comments", field: "only_private_comments" }
		table_columns_object.push(user_only_private_comments_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	* USER RESTRICTED AGENT
	/*****************************************************************************************/
	if (include_user_restricted_agent === 'true') {
		var user_restricted_agent_column_object = { title: "Restricted Agent", field: "restricted_agent" }
		table_columns_object.push(user_restricted_agent_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	* USER SUSPENSION STATUS
	/*****************************************************************************************/
	if (include_user_suspended === 'true') {
		var user_suspended_column_object = { title: "Suspended", field: "suspended" }
		table_columns_object.push(user_suspended_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	* USER DEFAULT GROUP NAME
	/*****************************************************************************************/
	if (include_user_default_group_name === 'true') {
		var user_default_group_name_column_object = { title: "Default Group", field: "default_group_name" }
		table_columns_object.push(user_default_group_name_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	* USER DEFAULT GROUP ID
	/*****************************************************************************************/
	if (include_user_default_group_id === 'true') {
		var user_default_group_id_column_object = { title: "Default Group ID", field: "default_group_id" }
		table_columns_object.push(user_default_group_id_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	* USER GROUPS
	/*****************************************************************************************/
	if (include_user_groups === 'true') {
		var user_groups_column_object = { title: "Agent Groups", field: "user_groups", headerSort: false }
		table_columns_object.push(user_groups_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	* USER REPORT CSV
	/*****************************************************************************************/
	if (include_user_report_csv === 'true') {
		var user_report_csv_column_object = { title: "Resport CSV", field: "report_csv" }
		table_columns_object.push(user_report_csv_column_object)
	}
	/*****************************************************************************************/

	/*****************************************************************************************
	* USER ORGANIZATIONS
	/*****************************************************************************************/
	if (include_user_organizations === 'true') {
		var user_organizations_column_object = { title: "Organizations", field: "organization_names", headerSort: false }
		table_columns_object.push(user_organizations_column_object)
	}
	/*****************************************************************************************/

	console.log("TABLE_COLUMN_OBJECTS:\n" + JSON.stringify(table_columns_object, null, '\t'))
	/*****************************************************************************************
	 * CREATE TABLE OBJECT
	 /*****************************************************************************************/
	//console.log("PROCESSED_ARRAY_OF_USER_OBJECTS:\n" + JSON.stringify(processed_array_of_user_objects, null, '\t'))
	var table = new Tabulator("#example-table", {
		data: processed_array_of_user_objects,
		height: "80%",
		layout: "fitColumns",
		clipboard: true,
		clipboardPasteAction: "replace",
		groupBy: group_by_key,
		//		groupBy: "role",
		//		groupValues: [
		//			["Admin", "Agent", "End-user"]
		//		],
		groupStartOpen: [true],
		columns: table_columns_object,

		/*
				columns: [
					/*			{
									title: "Name", field: "name", formatter: "link", formatterParams: {
										labelField: "name",
										urlField: "agent_url",
										target: "_blank"
									}
								},*/
		/*
			user_id_column_object,
			name_column_object,
			{
				title: "Email", field: "email", formatter: "link", formatterParams: {
					labelField: "email",
					urlPrefix: "mailto://",
					target: "_blank"
				}
			},
			{ title: "Role", field: "role" },
			{ title: "Tags", field: "tags", headerSort: false },
			{ title: "Last Login Date", field: "last_login_date" },
			{ title: "Last Login Time", field: "last_login_time" },
			{ title: "Organizations", field: "organization_names", headerSort: false }
		]
,*/
		initialSort: [
			{
				//				column: "name", dir: "asc"
				column: sort_by_key, dir: "asc"
			}
		],
		movableColumns: true,
		pagination: true,
		paginationSize: 25,
		paginationSizeSelector: [10, 25, 50, 100, true] //select list with an "all" option at the end of the list
	})
	/*****************************************************************************************/

	/*****************************************************************************************/
	//trigger download of <zendesk subdomain>_users.csv file
	/*****************************************************************************************/
	document.getElementById("download-csv").addEventListener("click", function () {
		table.download("csv", `${zd_domain}_users.csv`);
	});
	/*****************************************************************************************/

	/*****************************************************************************************/
	//trigger download of <zendesk subdomain>_users.json file
	/*****************************************************************************************/
	document.getElementById("download-json").addEventListener("click", function () {
		table.download("json", `${zd_domain}_users.json`);
	});
	/*****************************************************************************************/

	/*****************************************************************************************/
	//trigger download of <zendesk subdomain>_users.xlsx file
	/*****************************************************************************************/
	document.getElementById("download-xlsx").addEventListener("click", function () {
		table.download("xlsx", `${zd_domain}_data.xlsx`, { sheetName: "My Data" });
	});
	/*****************************************************************************************/

	/*****************************************************************************************/
	//trigger download of <zendesk subdomain>_users.pdf file
	/*****************************************************************************************/
	document.getElementById("download-pdf").addEventListener("click", function () {
		table.download("pdf", `${zd_domain}_users.pdf`, {
			orientation: "portrait", //set page orientation to portrait
			title: `${zd_domain} Users Report`, //add title to report
		});
	});
	/*****************************************************************************************/

	/*****************************************************************************************/
	//trigger download of data.html file
	/*****************************************************************************************/
	document.getElementById("download-html").addEventListener("click", function () {
		table.download("html", `${zd_domain}_users.html`, { style: true });
	});
	/*****************************************************************************************/

	/*****************************************************************************************/
	// settings
	/*****************************************************************************************/
	document.getElementById("settings").addEventListener("click", function () {
		//table.download("html", `${zd_domain}_users.html`, { style: true });
		location.href = './settings.html';
	});
	/*****************************************************************************************/


	DeleteGlobalVariables()
	/*****************************************************************************************/

	/*****************************************************************************************/
}; // END main FUNCTION
/*****************************************************************************************/

/*****************************************************************************************/
function DeleteGlobalVariables() {

	url = undefined
	counter = undefined
	all_users = undefined
	zd_client_context = undefined
	css = undefined

	delete (url, counter, all_users, zd_client_context, css)
}
/*****************************************************************************************/

