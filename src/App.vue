<template>
  <div id="app">
    <section  class="main-content-wrapper wrapper" >
        <section id="main-content" >
            <div class="row">
                <div class="col-md-12">
                    <!-- 查询 -->
                    <ul class="btn-edit fl">
                        <li class="input-serach">
                            <el-input :placeholder="placeholder" v-model="keywords" style="width: 300px;">
                                <el-select v-model="select" @change="searchFieldChange" slot="prepend">
                                    <el-option label="用户名" value="username"></el-option>
                                    <el-option label="姓名" value="name"></el-option>
                                    <el-option label="电话" value="phone"></el-option>
                                </el-select>
                                <el-button type="danger" class="danger" slot="append" icon="search" @click="query"></el-button>
                            </el-input>
                        </li>
                    </ul>
                    <!-- 操作 -->
                    <ul class="btn-edit fr">
                        <li >
                            <el-button type="primary" @click="dialogCreateVisible = true">添加用户</el-button>
                            <el-button type="primary" icon="delete" :disabled="selected.length==0" @click="removeUsers()"  >删除</el-button>
                        </li>
                    </ul>
                    <!-- 用户列表-->
                    <el-table :data="users"
                              stripe
                              v-loading="loading"
                              element-loading-text="拼命加载中..."
                              style="width: 100%"
                              height="443"
                              @sort-change="tableSortChange"
                              @selection-change="tableSelectionChange">
                        <el-table-column type="selection"
                                         width="60">
                        </el-table-column>
                        <el-table-column sortable="custom" prop="username"
                                         label="用户名"
                                         width="100">
                        </el-table-column>
                        <el-table-column prop="name"
                                         label="姓名"
                                         width="80">
                        </el-table-column>
                        <el-table-column prop="phone"
                                         label="手机">
                        </el-table-column>
                        <el-table-column prop="email"
                                         label="邮箱">
                        </el-table-column>
                        <el-table-column prop="create_time" sortable="custom" inline-template
                                         label="注册日期">
                            <div>{{ row.create_time | moment('YYYY年MM月DD日 HH:mm:ss')}}</div>
                        </el-table-column>
                        <el-table-column inline-template
                                         label="操作"
                                         width="250">
                            <span>
                                <el-button type="primary" size="mini" @click="removeUser(row)">删除</el-button>
                                <el-button type="primary" size="mini" @click="setCurrent(row)">编辑</el-button>
                            </span>
                        </el-table-column>
                    </el-table>
                    <!--分页begin-->
                    <el-pagination class="tc mg"
                                   :current-page="filter.page"
                                   :page-sizes="[10, 20, 50, 100]"
                                   :page-size="filter.per_page"
                                   layout="total, sizes, prev, pager, next, jumper"
                                   :total="total_rows"
                                   @size-change="pageSizeChange"
                                   @current-change="pageCurrentChange">
                    </el-pagination>
                    <!--分页end-->
                </div>
            </div>
        </section>
    </section>

    <!-- 创建用户 begin-->
    <el-dialog title="创建用户" v-model="dialogCreateVisible" :close-on-click-modal="false" :close-on-press-escape="false" @close="reset" >
        <el-form id="#create" :model="create" :rules="rules" ref="create" label-width="100px">
            <el-form-item label="用户名" prop="username">
                <el-input v-model="create.username"></el-input>
            </el-form-item>
            <el-form-item label="姓名" prop="name">
                <el-input v-model="create.name"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input v-model="create.password" type="password" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="checkpass">
                <el-input v-model="create.checkpass" type="password"></el-input>
            </el-form-item>
            <el-form-item label="电话" prop="phone">
                <el-input v-model="create.phone"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="create.email"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogCreateVisible = false">取 消</el-button>
            <el-button type="primary" :loading="createLoading" @click="createUser">确 定</el-button>
        </div>
    </el-dialog>
    <!-- 修改用户 begin-->
    <el-dialog title="修改用户信息" v-model="dialogUpdateVisible"  :close-on-click-modal="false" :close-on-press-escape="false">
        <el-form id="#update" :model="update" :rules="updateRules" ref="update" label-width="100px">
            <el-form-item label="姓名" prop="name">
                <el-input v-model="update.name"></el-input>
            </el-form-item>
            <el-form-item label="电话" prop="phone">
                <el-input v-model="update.phone"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="update.email"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogUpdateVisible = false">取 消</el-button>
            <el-button type="primary" :loading="updateLoading" @click="updateUser">确 定</el-button>
        </div>
    </el-dialog>
  </div>
</template>
<script>
var placeholders={"name":"请输入查找姓名","username":"请输入查找用户名","phone":"请输入查找电话"};
function getuuid(){
    var uid = [];
    var hexDigits = "0123456789abcdefghijklmnopqrst";
    for (var i = 0; i < 32; i++) {
        uid[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    uid[6] = "4";
    uid[15] = hexDigits.substr((uid[15] & 0x3) | 0x8, 1);
    var uuid = uid.join("");
    return uuid;
}
export default {
  name: 'app',
  data: function() {

      var validatePass = (rule, value, callback) => {
          if (value === '') {
              callback(new Error('请再次输入密码'));
          } else if (value !== this.create.password) {
              callback(new Error('两次输入密码不一致!'));
          } else {
              callback();
          }
      };

      return {
          url: 'url',
          users: [
          ],
          create: {
              id: '',
              username: '',
              name: '',
              password: '',
              checkpass: '',
              phone: '',
              email: '',
              is_active: true
          },
          currentId:'',
          update:{
              name: '',
              phone: '',
              email: '',
              is_active: true
          },
          rules: {
              name: [
                  { required: true, message: '请输入姓名', trigger: 'blur' },
                  { min: 3, max: 15, message: '长度在 3 到 15 个字符'}
              ],
              username: [
                  { required: true, message: '请输入用户名', trigger: 'blur' },
                  { min: 3, max: 25, message: '长度在 3 到 25 个字符'},
                  { pattern:/^[A-Za-z0-9]+$/, message: '用户名只能为字母和数字'}
              ],
              password: [
                  { required: true, message: '请输入密码', trigger: 'blur' },
                  { min: 6, max: 25, message: '长度在 6 到 25 个字符'}
              ],
              checkpass: [
                  { required: true, message: '请再次输入密码', trigger: 'blur' },
                  { validator: validatePass}
              ],
              email: [
                  { type: 'email', message: '邮箱格式不正确'}
              ],
              phone:[
                  { pattern:/^1[34578]\d{9}$/, message: '请输入中国国内的手机号码'}
              ]
          },
          updateRules: {
              name: [
                  { required: true, message: '请输入姓名', trigger: 'blur' },
                  { min: 3, max: 15, message: '长度在 3 到 15 个字符'}
              ],
              email: [
                  { type: 'email', message: '邮箱格式不正确'}
              ],
              phone:[
                  { pattern:/^1[34578]\d{9}$/, message: '请输入中国国内的手机号码'}
              ]
          },
          filter: {
              per_page: 10, // 页大小
              page: 1, // 当前页
              name:'',
              username:'',
              phone:'',
              sorts:''
          },
          total_rows: 0,
          keywords: '', //搜索框的关键字内容
          select: 'username', //搜索框的搜索字段
          loading: true,
          selected: [], //已选择项
          dialogCreateVisible: false, //创建对话框的显示状态
          dialogUpdateVisible: false, //编辑对话框的显示状态
          createLoading: false,
          updateLoading: false,
          placeholder:placeholders["username"]
      };
  },
  mounted: function() {
      this.getUsers();
  },
  methods: {
      tableSelectionChange(val) {
          this.selected = val;
      },
      tableSortChange(val) {
          console.log(`排序属性: ${val.prop}`);
          console.log(`排序: ${val.order}`);
          if(val.prop!=null){
              if(val.order=='descending'){
                  this.filter.sorts = '-'+val.prop;
              }
              else{
                  this.filter.sorts = ''+val.prop;
              }
          }
          else{
              this.filter.sorts = '';
          }
          this.getUsers();
      },
      searchFieldChange(val) {
          this.placeholder=placeholders[val];
          console.log(`搜索字段： ${val} `);
      },
      pageSizeChange(val) {
          console.log(`每页 ${val} 条`);
          this.filter.per_page = val;
          this.getUsers();
      },
      pageCurrentChange(val) {
          console.log(`当前页: ${val}`);
          this.filter.page = val;
          this.getUsers();
      },
      setCurrent(user){
          this.currentId=user.id;
          this.update.name=user.name;
          this.update.phone=user.phone;
          this.update.email=user.email;
          this.update.is_active=user.is_active;
          this.dialogUpdateVisible=true;
      },
      // 重置表单
      reset() {
          this.$refs.create.resetFields();
      },
      query(){
          this.filter.name='';
          this.filter.username='';
          this.filter.phone='';
          this.filter[this.select]=this.keywords;
          this.getUsers();
      },
      // 获取用户列表
      getUsers() {
          this.loading = true;

          var resource = this.$resource(this.url);
          resource.query(this.filter)
              .then((response) => {
              this.users = response.data.datas;
              this.total_rows = response.data.total_rows;
              this.loading = false;
              this.selected.splice(0,this.selected.length);
          })
          .catch((response)=> {
                  this.$message.error('错了哦，这是一条错误消息');
              this.loading = false;
          });

      },

      // 创建用户
      createUser(){
          // 主动校验
          this.$refs.create.validate((valid) => {
              if (valid) {
                  this.create.id=getuuid();
                  this.createLoading=true;
                  var resource = this.$resource(this.url);
                  resource.save(this.create)
                      .then((response) => {
                      this.$message.success('创建用户成功！');
                      this.dialogCreateVisible=false;
                      this.createLoading=false;
                      this.reset();
                      this.getUsers();
              })
              .catch((response) => {
                      var data=response.data;
                      if(data instanceof Array){
                          this.$message.error(data[0]["message"]);
                      }
                      else if(data instanceof Object){
                          this.$message.error(data["message"]);
                      }
                      this.createLoading=false;
                  });
              }
              else {
              return false;
              }
          });
      },

      // 更新用户资料
      updateUser() {
          this.$refs.update.validate((valid) => {
              if (valid) {
                  this.updateLoading=true;
                  var actions = {
                      update: {method: 'patch'}
                  }
                  var resource = this.$resource(this.url,{},actions);
                  resource.update({"ids":this.currentId},this.update)
                      .then((response) => {
                      this.$message.success('修改用户资料成功！');
                      this.dialogUpdateVisible=false;
                      this.updateLoading=false;
                      this.getUsers();
              })
              .catch((response) => {
                  var data=response.data;
                  console.log(data);
                  if(data instanceof Array){
                      this.$message.error(data[0]["message"]);
                  }
                  else if(data instanceof Object){
                      this.$message.error(data["message"]);
                  }
                  this.updateLoading=false;
              });
              }
              else {
                  return false;
              }
          });
      },

      // 删除单个用户
      removeUser(user) {
          this.$confirm('此操作将永久删除用户 ' + user.username + ', 是否继续?', '提示', { type: 'warning' })
              .then(() => {
              // 向请求服务端删除
              var resource = this.$resource(this.url + "{/id}");
              resource.delete({ id: user.id })
                  .then((response) => {
                  this.$message.success('成功删除了用户' + user.username + '!');
                  this.getUsers();
              })
              .catch((response) => {
                      this.$message.error('删除失败!');
               });
          })
          .catch(() => {
              this.$message.info('已取消操作!');
          });
      },
      //删除多个用户
      removeUsers() {
          this.$confirm('此操作将永久删除 ' + this.selected.length + ' 个用户, 是否继续?', '提示', { type: 'warning' })
              .then(() => {
              console.log(this.selected);
          var ids = [];
          //提取选中项的id
          $.each(this.selected,(i, user)=> {
                  ids.push(user.id);
              });
          // 向请求服务端删除
          var resource = this.$resource(this.url);
          resource.remove({ids: ids.join(",") })
              .then((response) => {
                  this.$message.success('删除了' + this.selected.length + '个用户!');
                  this.getUsers();
          })
          .catch((response) => {
                  this.$message.error('删除失败!');
          });
      })
      .catch(() => {
          this.$Message('已取消操作!');
      });
      }
  }
}
</script>
<style>
    @import './assets/plugins/bootstrap/css/bootstrap.min.css';
    @import './assets/css/global.css';
    @import './assets/css/main.min.css';
</style>