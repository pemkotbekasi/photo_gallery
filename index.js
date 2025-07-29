const fs = require('fs')
const crypto = require('crypto');
const myArgs = process.argv.slice(2);
const ENCRYPTION_KEY = Buffer.from(myArgs[0], 'base64');
const IV_LENGTH = 16;
const algorithm = 'aes-256-ctr';


async function Donload(imageUrl, imageName, path) {

    // const command = `wget --debug -nc "${imageUrl}" -O picture/${path}/${imageName}.jpg \n`
    const command = `aria2c -c "${imageUrl}" -d picture/${path} -o ${imageName}.jpg \n`;

    // Path ke file yang ingin diubah atau dibuat jika belum ada
    const filePath = `${path}.txt`;

    // Teks yang ingin ditambahkan ke file
    const textToAdd = command;

    // Fungsi untuk menambahkan teks ke dalam file
    function appendTextToFile(filePath, textToAdd) {
        // Gunakan flag 'a' untuk mode append (menambahkan teks ke akhir file)
        fs.writeFile(filePath, textToAdd, { flag: 'a' }, (err) => {
            if (err) {
                console.error('Terjadi kesalahan:', err);
                return;
            }
            console.log('Teks berhasil ditambahkan ke file.');
        });
    }

    // Panggil fungsi untuk menambahkan teks ke dalam file
    appendTextToFile(filePath, textToAdd);
}

function Mkdir(dirName) {
    if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName);
    }
}

function encrypt(text) {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}


Mkdir('data')
Mkdir('json')
Mkdir('user_data')

function queueJoB() {

    try {
        var Createfile = fs.readFileSync('./data/queue.json', { encoding: 'utf8', flag: 'r' });
        var FindUser = JSON.parse(Createfile)[0].name
        var CurrentFile = 'queue.json'
    } catch {
        var Createfile = fs.readFileSync('./data/data.json', { encoding: 'utf8', flag: 'r' });
        var FindUser = JSON.parse(Createfile)[0].name
        var CurrentFile = 'data.json'

    }

    return { Createfile, FindUser, CurrentFile }

}

async function GetJob() {
    const puppeteer = require('puppeteer');

    return new Promise(async (resolve) => {

        const GetQueueJob = queueJoB()
        // Create a browser instance
        const browser = await puppeteer.launch(
            { headless: "new", defaultViewport: null, args: ['--no-sandbox'] }
        );
        try {
            // Create a new page
            const page = await browser.newPage();

            const saveCookie = async (page) => {
                const cookies = await page.cookies();
                const cookieJson = JSON.stringify(cookies, null, 2);

                fs.writeFileSync('./data/enkrip.txt', encrypt(cookieJson));
                console.log("kuki save")
                // fs.writeFileSync('./kuki.json', cookieJson);

            }
            const loadCookie = async (page) => {
                const adsdas = fs.readFileSync('./data/enkrip.txt', { encoding: 'utf8', flag: 'r' })

                // const kuki = fs.readFileSync('./kuki.json', { encoding: 'utf8', flag: 'r' })

                const cookies = JSON.parse(
                    decrypt(adsdas)
                    // kuki
                );
                await page.setCookie(...cookies);
            }

            // Custom user agent
            const customUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36';

            // Set custom user agent
            await page.setUserAgent(customUA);

            // Add mouse scroll for up to 20 seconds
            let startTime = Date.now();
            let scrollInterval = setInterval(async () => {
                const timeElapsed = Date.now() - startTime;

                if (timeElapsed >= 20000) {
                    clearInterval(scrollInterval);
                } else {
                    await page.evaluate(() => {
                        window.scrollBy(0, window.innerHeight); // Scroll down by the viewport height
                    });
                }
            }, 300); // Scroll every 200 milliseconds

            page.on('response', async response => {
                try {

                    if (response.url().includes("https://www.instagram.com/graphql/query")) {



                        const status = response.status();
                        if (status < 300 || status >= 400) {
                            try {



                                const data = (await response.json())



                                if(data?.data.user !==undefined){
                                    const user_id = data.data.user.pk || 0
                                    const JsonUserID = user_id

                                    if(user_id!==0){
                                        data.data.user.snapshot_date = Date.now();
                                        fs.writeFileSync(`./user_data/${JsonUserID}_userdata.json`, JSON.stringify(data));
                                        console.log('save data user detail');
                                    }

                                  

                                }else{
                                console.log('data user detail notfound')
                                }


                                
                                if (data?.data?.xdt_api__v1__feed__user_timeline_graphql_connection !== undefined) {

                                    if (data.data.xdt_api__v1__feed__user_timeline_graphql_connection.edges[0].node.code) {

                                        // console.log(data.data.xdt_api__v1__feed__user_timeline_graphql_connection.edges[0].node.code)

                                        try {
                                                
                                            const currentUrl = page.url(); // alamat di address bar


                                            data.data.xdt_api__v1__feed__user_timeline_graphql_connection.edges
                                            const Filename = data.data.xdt_api__v1__feed__user_timeline_graphql_connection.edges[0].node.owner.pk
                                            const username = data.data.xdt_api__v1__feed__user_timeline_graphql_connection.edges[0].node.owner.username
                                            Mkdir('picture')
                                            Mkdir(`./picture/${username}`)

                                            const Isi = data.data.xdt_api__v1__feed__user_timeline_graphql_connection.edges.map(d => {
                                                return {
                                                    current_url:currentUrl,
                                                    snapshot_date : Date.now(),
                                                    id: d.node.code,
                                                    image: d.node.image_versions2.candidates[0].url,
                                                    caption: d.node.caption == null || d.node.caption == undefined ? '' : d.node.caption.text,
                                                    post_time: d.node.taken_at,
                                                    owner: Filename,
                                                    username: username,
                                                    comment_count: d.node.comment_count|| 0,
                                                    like_count: d.node.like_count || 0,
                                                    cdn_image: `//cdn.jsdelivr.net/gh/pemkotbekasi/photo_gallery/picture/${Filename}/${d.node.code}.jpg`
                                                }
                                            })

                                            if (fs.existsSync(`./json/${Filename}.json`)) {
                                                // Baca isi file secara synchronous
                                                const fileContent = fs.readFileSync(`./json/${Filename}.json`, 'utf8');


                                                const uniqueArray = JSON.parse(fileContent).filter((obj, index, self) =>
                                                    index === self.findIndex(o => o.id === obj.id && o.owner === obj.owner)
                                                );

                                                await require('fs').promises.writeFile(`./json/${Filename}.json`, JSON.stringify(uniqueArray.concat(Isi)));

                                                // console.log('Isi file:', fileContent);
                                            } else {
                                                await require('fs').promises.writeFile(`./json/${Filename}.json`, JSON.stringify(Isi));
                                            }

                                            const asdasdasd = JSON.parse(GetQueueJob.Createfile)

                                            const filteredData = asdasdasd.filter(item => item.name !== GetQueueJob.FindUser)

                                            const WriteFindUserId = fs.readFileSync('./data/data.json', { encoding: 'utf8', flag: 'r' })
                                            const filteredDataWriteFindUserId = JSON.parse(WriteFindUserId).filter(item => item.name !== GetQueueJob.FindUser)

                                            Isi.map(d => Donload(d.image, d.id, Filename))

                                            fs.writeFileSync('./data/queue.json', JSON.stringify(filteredData));

                                            // add user id instagram
                                            fs.writeFileSync('./data/data.json', JSON.stringify(filteredDataWriteFindUserId.concat({ name: GetQueueJob.FindUser, id: Filename })));

                                            await saveCookie(page);
                                            // console.log(GetQueueJob.FindUser + ' sucess');

                                            return resolve(GetQueueJob.FindUser + ' sucess');
                                        } catch (e) {
                                            const asdasdasd = JSON.parse(GetQueueJob.Createfile)

                                            const filteredData = asdasdasd.filter(item => item.name !== GetQueueJob.FindUser)
                                            fs.writeFileSync('./data/queue.json', JSON.stringify(filteredData));
                                            // console.log(FindUser + ' add to queue');
                                            console.log(e)
                                            return resolve(GetQueueJob.FindUser + ' add to queue');
                                        }

                                    }

                                }
                            } catch (err) {
                                console.error('Error getting body:', err.message);
                            }
                        } else {
                            console.log(`Redirect response ignored: ${response.url()}`);
                        }





                    }

                } catch {

                }

            });

            const website_url = `https://www.instagram.com/${GetQueueJob.FindUser}/?_showcaption=true`;

            // Open URL in current page

            await loadCookie(page);
            await page.goto(website_url, { waitUntil: 'networkidle0' });

            // Close the browser instance
            // await browser.close();

        } catch (error) {
            // console.log(error);
        } finally {
            await browser.close();

            if (queueJoB().CurrentFile === 'data.json') {
                console.log('finish')

                const {MergeJson} = require('@rahadiana/simple_merge_json')
const fs = require('fs')

async function MergeData(){
                                        
    fs.writeFileSync(`./merge.json`, JSON.stringify(await MergeJson(__dirname+'/json/')));
    
}

MergeData()

            } else {
                GetJob().then(console.log)

            }
        }

    })
}

const CurrenJob = queueJoB()

if (CurrenJob.CurrentFile === 'data.json') {

    fs.writeFileSync('./data/queue.json', CurrenJob.Createfile);
    GetJob()

} else {

    GetJob()
}
