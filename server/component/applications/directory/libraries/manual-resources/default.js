document.executeOnce('/manual-resources/employee/employee/')
document.executeOnce('/manual-resources/company/company/')
document.executeOnce('/manual-resources/relations/relations/')
document.executeOnce('/manual-resources/comment/comment/')

resources = {
	employee : new Directory.Employee(),
	company : new Directory.Company(),
	link : new Directory.Relations.CompanyEmployeeLink(),
	companyComment : new Directory.Comments.Company(),
	employeeComment : new Directory.Comments.Employee ()
}