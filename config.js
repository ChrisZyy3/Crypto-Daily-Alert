const POLYGON_API_KEY = 'Ts8s5m6AnaCu4rvgNtuPkEe1hwBDopCv' // polygon api key
const WXPUSHER_APP_TOKEN = 'AT_rLTnE34Ku7dH8iEV09tPLJghV8P6bttj' // wxpusher app token  

const IS_TEST = true // true for test, false for production
const WXPUSHER_TOPIC_ID_TEST = [30709] // topicId(number) for push notification - test
const WXPUSHER_TOPIC_ID_PROD = [34181] // topicId(number) for push notification - production  
const WXPUSHER_TOPIC_ID = IS_TEST ? WXPUSHER_TOPIC_ID_TEST : WXPUSHER_TOPIC_ID_PROD

export { POLYGON_API_KEY, WXPUSHER_APP_TOKEN, WXPUSHER_TOPIC_ID }