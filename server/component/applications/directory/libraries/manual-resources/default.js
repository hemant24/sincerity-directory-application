document.executeOnce('/manual-resources/employee/employee/')
document.executeOnce('/manual-resources/company/company/')
document.executeOnce('/manual-resources/relations/relations/')

resources = {
	employee : new Directory.Employee(),
	company : new Directory.Company(),
	link : new Directory.Relations.CompanyEmployeeLink()
}