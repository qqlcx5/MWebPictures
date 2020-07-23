const axios = require('axios')
const fs = require('fs')
const config = require('./config.json')
const {repo, token} = config
const moment = require('moment');
moment.locale('zh-cn');

var log4js = require('log4js')
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'app.log', category: 'GithubPicBed' }
  ]
})
var log = log4js.getLogger('GithubPicBed')

/**
 * @param  {[String]} file {picture path}
 * @return {[String]} {picture pid}
 */
async function getImgUrl(file){
	if (repo.length == 0 || repo.length == 0)
		throw 'config error'
	try{
		let bitmap = fs.readFileSync(file)
		let base64Img = Buffer.from(bitmap).toString('base64')
		let timestamp = moment().format('YYYYMMDDHHmmss')+'.jpg'
		let imageUrl = 'https://api.github.com/repos/'+repo+'/contents/'+'img/'+timestamp
		let body = {
			'branch': 'master',
			'message': 'upload image',
			'content': base64Img,
			'path': timestamp,
		}
		let upImgResp = await axios.put(imageUrl, body, {
			headers: {
				'Authorization':'token '+token,
				'Content-Type': 'application/json; charset=utf-8',
			}
		})
		imgUrl = upImgResp.data['content']['download_url']

		// https://raw.githubusercontent.com/qqlcx5/figure-bed/master/img/20200710225424.jpg
		// https://cdn.jsdelivr.net/gh/qqlcx5/figure-bed/img/20200710225424.jpg
		// https://cdn.jsdelivr.net/gh/qqlcx5/figure-bed@1.0/img/20200710230042.jpg
		// https://cdn.jsdelivr.net/gh/qqlcx5/figure-bed/blob/1.0/img/20200708131448.jpg
		
		if (imgUrl) {
			log.info('success upload a pic to: '+ imgUrl)
			const replaceCDN = imgUrl.replace('raw.githubusercontent.com','cdn.jsdelivr.net/gh')
			const rmMaster = replaceCDN.replace('/master','@1.2')
			log.info('success upload a rmMaster: '+ rmMaster)
			return rmMaster
		} else {
			throw 'no img url '
		}
	}
	catch(e){
		log.error('upload failed with error: '+e)
		throw 'no img url '
	}
}

module.exports = getImgUrl