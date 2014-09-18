

app.routes = {
	'/*': [
		'manual',
		{
			type: 'filter',
			library: '/filters/statistics/',
			next: 'templates'
		},
		{
			type: 'cacheControl',
			mediaTypes: {
				'image/*': 'farFuture',
				'text/css': 'farFuture',
				'application/x-javascript': 'farFuture'
			},
			next: {
				type: 'less',
				next: 'static'
			}
		}
	],
	'employee/' : '@employee',
	'employee/{id}/' : '@employee',
	'company/' : '@company',
	'company/{id}/' : '@company',
	'link/' : '@link',
	'link/{id}/' : '@link'

}

app.hosts = {
 	'default' : '/directory/'
}

app.dispatchers = {
    javascript: '/manual-resources/'
}
