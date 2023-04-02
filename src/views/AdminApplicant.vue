// Unused File
<template>
  <div>
  <h1>This is the individual applicant view for the admin</h1>
  <Header></Header>
    <v-data-table
    :headers="Headers"
    :items="tasks"
    item-key="index"
    class="elevation-1"
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>{{applicant.name}}</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
    </template>
    <template v-slot:item.upload="{ item }">
      <v-icon color="accent"> {{item.upload ? downloadIcons.upload : downloadIcons.noUpload}}</v-icon>
    </template>
    <template v-slot:item.buttonTitle="{item}">
      <td>
      <v-btn
        rounded
        color="accent"
        dark
        :disabled="item.value == 'Incomplete'"
        @click="changeStatus(item.status, tasks.indexOf(item))"
        >
        {{item.buttonTitle}}
      </v-btn>
      </td>
    </template>
  </v-data-table>
  <Footer></Footer>
  </div>
</template>

<script>
  import Header from "../components/Header.vue"
  import Footer from "../components/Footer.vue"
  import {getUserById, updateUser} from "../services/apiServices"
  
export default {
  name: 'AdminApplicant',

  components: {
    'Header': Header,
    'Footer': Footer
  },

  created(){
    this.id = this.$route.params.id;
    getUserById(this.id).then(res => {
        this.applicant = res.data
        let servertasks = res.data.tasks
        for (const task in servertasks) {
          if(servertasks[task].isApproved && servertasks[task].isApproved){
            servertasks[task].status = "Complete";
            servertasks[task].buttonTitle = "Mark Incomplete"
          }else if(servertasks[task].isSubmitted && !servertasks[task].isApproved){
            servertasks[task].status = "Requires Approval"
            servertasks[task].buttonTitle = "Mark Complete"
          }else if(!servertasks[task].isApproved && !servertasks[task].isApproved){
            servertasks[task].status = "Incomplete"
            servertasks[task].buttonTitle = "Mark Complete"

          }
          this.tasks.push(servertasks[task])
        }
      });
  },

  data(){
    return {
        expanded: [],
        singleExpand: false,
        id: '',
        applicant: [],
        tasks: [],
        selectedIndex: '',
        status: {
          Complete: {
            color: "complete",
            title: "Complete",
            icon: "mdi-check-circle",
          },
          InProgress: {
            color: "inprogress",
            title: "Waiting Approval",
            icon: "mdi-dots-horizontal-circle",
          },
          Incomplete: {
            color: "needsattention",
            title: "Incomplete",
            icon: "mdi-alert",
          },
        },
        downloadIcons: {
        noUpload: "mdi-cloud-off-outline",
        upload: "mdi-cloud-download",
        uploadComplete: "mdi-cloud-check",
      },
        Headers: [
          {
            text: 'Task Name',
            align: 'start',
            sortable: false,
            value: 'name',
          },
          {
            text: 'Completion Status',
            align: 'start',
            value: 'status',
          },
          {
            text: 'Download',
            align: 'start',
            value: 'upload',
          },
          {
            text: 'Button',
            align: 'middle',
            value: 'buttonTitle'
          }
        ],
      }
  },

  methods: {
    async updateUser(applicant){
      await updateUser(applicant).then(response => {
          this.applicant = response.data;
          this.$emit('emitToApp', response.data);
      });
    },
    
    changeStatus: function(status, index) {
      let selectedTask = this.tasks[index];
      if (selectedTask.status === "Requires Approval" || selectedTask.status === "Incomplete") {
        selectedTask.status = "Complete";
        selectedTask.buttonTitle = "Mark Incomplete";
        this.applicant.tasks[index].isSubmitted = true;
        this.applicant.tasks[index].isApproved = true;
      }else if (selectedTask.status === "Complete") {
        selectedTask.status = "Incomplete";
        selectedTask.buttonTitle = "Mark Complete";
        this.applicant.tasks[index].isSubmitted = false;
        this.applicant.tasks[index].isApproved = false;
      }
      console.log(this.applicant);
      this.updateUser(this.applicant);
    }
  }
}
</script>
