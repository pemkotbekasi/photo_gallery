
const {MergeJson} = require('@rahadiana/simple_merge_json')



async function oo(){
  const dta = await MergeJson(__dirname+'/json/')

  console.log(
    JSON.stringify(JSON.parse(dta))
  )

}
