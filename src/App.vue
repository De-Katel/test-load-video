<template>
  <form @submit="formSubmit">
    <input type='file' name="file" />
    <button>add file</button>
  </form>
  <div class="project">
    <div class="item_video" v-for="item in videosForScanning" :key="item.idVideo">
      <div>{{ item.idVideo }}</div>
      <div class="status"> {{ item.coment ? item.coment : 'Ожидает сканирования' }}</div>
      <div class="scanprogress" v-if="item.isScan">{{ item.scanProgress }}</div>
      <div v-else-if="item.isComlete">Complite!!!</div>
      <div v-else>
        <button :disabled="openSocket" @click="hendlerClick(item.idVideo)">start scan</button>
        <button @click="removeVideo(item.idVideo)">delete</button>
      </div>

    </div>
  </div>
</template>

<script>

export default {
  name: 'App',
  components: {

  },
  data() {
    return {
      videosForScanning: [],
      openSocket: false
    }
  },
  methods: {
    
    hendlerClick(id) {

      this.openSocket = true

      this.videosForScanning = this.videosForScanning.map((item) => {
        if (item.idVideo === id) { return { ...item, isScan: true } }
        else { return item }
      })

      let socket = new WebSocket(`ws://158.160.12.110/ws/ready/${id}/?token=e3b1ca5774f9f4a941ebab13136616b37fb374db`);

      socket.onopen = () => { console.log("[open] Соединение установлено"); this.openSocket = true };

      socket.onmessage = (e) => {
        console.log(e.data);
        const currentScanProgress = JSON.parse(e.data).complete; //считал прогресс
        const coment = JSON.parse(e.data).status_str  //считал статус

        this.videosForScanning = this.videosForScanning.map((item) => {
          if (item.idVideo === id) { return { ...item, coment: coment, scanProgress: currentScanProgress } }
          else { return item }
        })

      }

      socket.onclose = () => {
        this.openSocket = false
        this.videosForScanning = this.videosForScanning.map((item) => {
          if (item.idVideo === id) { return { ...item, isScan: false, isComlete: true } } else { return item }
        })

      };
      socket.onerror = () => { console.log(`[error]`); this.openSocket = false };

      fetch(`http://158.160.12.110/api/run-scan/${id}`, {
        method: 'GET',
        headers: { authorization: 'Token  e3b1ca5774f9f4a941ebab13136616b37fb374db' }
      })
    },
    formSubmit(e) {
      e.preventDefault()
      let bodyForAddVideo = new FormData(e.target)

      bodyForAddVideo.append('project_id', '89')
      bodyForAddVideo.append('freq', 'value2')
      bodyForAddVideo.append('direction', 'forward')

      console.log(bodyForAddVideo);

      fetch('http://158.160.12.110/api/videos', {
        method: 'POST',
        body: bodyForAddVideo,
        headers: { authorization: 'Token  e3b1ca5774f9f4a941ebab13136616b37fb374db' }
      })
        .then((res) => res.json())
        .then((data) => this.videosForScanning.push({
          idVideo: data.video_id,
          isScan: false,
          isComlete: false,
          coment: '',
          scanProgress: 0,
          isDisabled: !this.openSocket ? false : true
        }))

    },
    removeVideo(id) {
      fetch(`http://158.160.12.110/api/videos/${id}`, {
        method: 'DELETE',
        headers: { authorization: 'Token  e3b1ca5774f9f4a941ebab13136616b37fb374db' }
      })
      const idx = this.videosForScanning.findIndex((el) => (el.idVideo === id));

      const before = this.videosForScanning.slice(0, idx);
      const after = this.videosForScanning.slice(idx + 1);
      this.videosForScanning = [...before, ...after];
    }
  }
}


</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.item_video {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px
}

.project {
  margin: 0 auto;
  width: 500px;
  border: #2c3e50 2px solid;
  padding: 10px;
  min-height: 200px;
}

.status {
  width: 30;
  font-size: small;
}

.qwe {
  background-color: black;
}

form {
  padding: 10px;
}

button {
  margin: 3px;
}

.scanprogress {
  width: 50px;
  text-align: center;
}
</style>
