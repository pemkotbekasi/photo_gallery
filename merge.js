
const {MergeJson} = require('@rahadiana/simple_merge_json')
const fs = require('fs')


async function post_data(){
  const dta = await MergeJson(__dirname+'/json/')

fs.writeFileSync("./post-data.json", JSON.stringify(JSON.parse(dta)));

}

post_data()

async function user_data(){
  const dta = await MergeJson(__dirname+'/user_data/')

fs.writeFileSync("./user_data.json", JSON.stringify(JSON.parse(dta)));

}

user_data()
