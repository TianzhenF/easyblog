import { ElMessageBox } from 'element-plus'
const confirm = (message,okrun) =>{
    ElMessageBox.confirm(
        message,'提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info',
        }).then(() => {
            okrun();
        }).catch(() => {    })
};
export default confirm;