document.executeOnce('/diligence/service/backup/')

if (application.globals.get('diligence.service.backup.importFixtures') == true) {
 Diligence.Backup.importMongoDbCollections()

}
