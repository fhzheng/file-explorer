class PathPart {
    constructor(part, is_file = false, is_root = false) {
        this.part = encodeURI(is_root ? '' : part)
        this.is_file = is_file
        this.is_root = is_root
    }
}
class PathManger {
    constructor(init) {
        var is_file = true
        this.ROOT = this.SLASH = '/'
        init = init || ROOT
        this.PARTS = [new PathPart('/', false, true)]
        if (init.endsWith(this.SLASH)) is_file = false
        var parts = init.split(/\/+/)
        if (parts[parts.length - 1] == '') parts.splice(parts.length - 1, 1)
        if (parts[0] == '') parts.splice(0, 1)
        for (let i = 0; i < parts.length; i++) {
            const element = parts[i];
            var part = new PathPart(element)
            if (i == parts.length - 1) {
                part.is_file = is_file
            }
            this.PARTS.push(part)
        }
    }
    push(part, is_file = false) {
        this.PARTS.push(new PathPart(part, is_file));
        return this.build();
    }
    pop() {
        if (this.PARTS.length > 1)
            this.PARTS.pop();
        return this.build();
    }
    build() {
        var result = ''
        for (let i = 0; i < this.PARTS.length; i++) {
            const element = this.PARTS[i];
            if (element.is_root) {
                result += this.ROOT
                continue
            }
            if (element.is_file) {
                result += element.part
                continue
            }
            else {
                result += element.part + this.SLASH
            }

        }
        return [result, this.PARTS[this.PARTS.length - 1]]
    }
}
var default_file = {
    name: 'files',
    type: 'directory',
    mtime: undefined,
    size: 0,
}
const router = new VueRouter({})
router.beforeRouteLeave = function (to, from, next) {
    debugger
    console.log(to, from, next)
    next()
}
const app = new Vue({
    router: router,
    data: {
        showBack: false,
        isFile: false,
        file: undefined,
        fileList: [
        ],
    },
    methods: {
        rowClick: function (row, column, event) {
            pm.push(row.name, row.type == 'file')
            displayContent()
        },
        goBack: function () {
            console.log('goback')
            router.push(pm.pop())
            displayContent()
        },
        download: function () {
            window.open(pm.build()[0])
        }
    },
    filters: {
        formatBytes: function (bytes, decimals = 2) {
            if (bytes === 0 || !bytes) return '-';

            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

            const i = Math.floor(Math.log(bytes) / Math.log(k));

            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        }
    }
}).$mount('#app')
var pm = new PathManger(router.history.current.fullPath)
console.log(pm)
displayContent()
function displayContent() {
    const ps = pm.build()
    const path = ps[0]
    const last_part = ps[1]
    router.push(path)
    if (last_part.is_root) {
        app.fileList = [default_file]
        app.showBack = false
    }
    else if (!last_part.is_file) {
        app.showBack = true
        axios.get(path, { responseType: 'json' }).then(function (resp) {
            const data = resp.data
            app.isFile = false
            app.fileList = data
        })
    }
    else {
        app.showBack = true
        app.isFile = true
        app.file = decodeURI(last_part.part)
    }
}
window.onpopstate = function (event) {
    var hash = document.location.hash
    hash = hash.substr(1, hash.length)
    pm = new PathManger(decodeURI(hash))
    displayContent()
}