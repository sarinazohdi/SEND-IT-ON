<template>
  <v-container fluid style="margin: 0 auto 0 auto; padding: 0px; width: 90%">
    <send-header
      fluid
      style="margin: 0 auto 0 auto; padding: 0px; width: 90%"
    ></send-header>
    <v-card class="mx-auto">
      <v-data-table
        :headers="_headers()"
        :items="resources"
        item-key="name"
        class="elevation-1"
      >
        <v-divider></v-divider>
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Resources</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-dialog v-if="user.isAdmin" v-model="dialogAddLink" max-width="500px">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="accent"
                  class="ml-2 mb-2"
                  v-bind="attrs"
                  v-on="on"
                >
                  Add Link
                </v-btn>
              </template>
              <v-card>
                <v-card-text>
                  <v-container>
                    <v-text-field
                      color="accent"
                      v-model="linkName"
                      label="Resource Name"
                      prepend-icon="mdi-information"
                      autocomplete="off"
                    ></v-text-field>
                    <v-text-field
                      color="accent"
                      v-model="link"
                      label="Add a link"
                      hint="www.example.com/page"
                      persistent-hint
                      prepend-icon="mdi-link"
                      autocomplete="off"
                    ></v-text-field>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="closeAddLink">
                    Cancel
                  </v-btn>
                  <v-btn color="blue darken-1" text @click="saveAddLink">
                    Save
                  </v-btn>
                </v-card-actions>
              </v-card>
              <v-snackbar color="red" v-model="snackbar" :timeout="3000">
                {{ saveError }}
                <template v-slot:action="{ attrs }">
                  <v-btn
                    color="white"
                    text
                    v-bind="attrs"
                    @click="snackbar = false"
                  >
                    Close
                  </v-btn>
                </template>
              </v-snackbar>
            </v-dialog>
            <v-dialog v-if="user.isAdmin" v-model="dialogAddFile" max-width="500px">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="accent"
                  class="ml-2 mb-2"
                  v-bind="attrs"
                  v-on="on"
                >
                  Add File
                </v-btn>
              </template>
              <v-card>
                <v-card-text>
                  <v-container>
                    <v-text-field
                      color="accent"
                      v-model="fileName"
                      label="Resource Name"
                      prepend-icon="mdi-information"
                      hint="If left empty, resource name will default to the file name of the file you select"
                      persistent-hint
                      autocomplete="off"
                    ></v-text-field>
                    <v-file-input
                      class="mt-4"
                      color="accent"
                      label="Upload a file"
                      accept="*/*"
                      v-model="fileData"
                    >
                    </v-file-input>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="closeAddFile">
                    Cancel
                  </v-btn>
                  <v-btn color="blue darken-1" text @click="saveAddFile">
                    Save
                  </v-btn>
                </v-card-actions>
              </v-card>
              <v-snackbar color="red" v-model="snackbar" :timeout="3000">
                {{ saveError }}
                <template v-slot:action="{ attrs }">
                  <v-btn
                    color="red"
                    text
                    v-bind="attrs"
                    @click="snackbar = false"
                  >
                    Close
                  </v-btn>
                </template>
              </v-snackbar>
            </v-dialog>
          </v-toolbar>
        </template>
        <template v-slot:item.link="{ item }">
          <v-btn
            v-if="item.isFile"
            target="_blank"
            :href="item.link"
            icon
            rel="noreferrer noopener"
            :download="item.name"
            rounded
            color="accent"
          >
            <v-icon>mdi-download</v-icon>
          </v-btn>
          <v-btn
            v-else
            target="_blank"
            :href="validateLink(item.link)"
            icon
            rounded
            color="accent"
          >
            <v-icon>mdi-open-in-new</v-icon>
          </v-btn>
        </template>
        <template v-slot:item.date="{ item }">
          {{ item.date }}
        </template>
        <template v-slot:item.upload="{ item }">
          <v-icon color="accent">
            {{ item.upload ? uploadIcons.upload : uploadIcons.noUpload }}
          </v-icon>
        </template>
        <template v-slot:item.delete="{ item }">
          <v-dialog v-model="dialogDelete" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon large color="accent" v-bind="attrs" v-on="on">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-title class="headline"
                >Are you sure you want to delete this item?</v-card-title
              >
              <v-card-actions>
                <v-btn color="blue darken-1" text @click="closeDelete">
                  Cancel
                </v-btn>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="deleteItemConfirm(item)"
                  >OK</v-btn
                >
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </template>
      </v-data-table>
      <send-footer></send-footer>
    </v-card>
  </v-container>
</template>

<script>
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import { deleteResource, getResources, getSignedInUserObj, updateResources, uploadFile } from "../services/apiServices";

export default {
  data() {
    return {
      resources: [],
      // Default isAdmin to false. Will get overwritted on render
      user: {
        isAdmin: false
      },

      dialogAddFile: false,
      dialogDelete: false,
      dialogAddLink: false,

      linkName: "",
      link: "",

      fileName: "",
      file: null,

      snackbar: false,
      saveError: "",

      fileData: null,
      fileURL: null,
      uploadValue: 0,

      headers: [
        {
          text: "Resource Name",
          align: "start",
          sortable: false,
          value: "name",
        },
        {
          text: "Resource",
          align: "start",
          sortable: false,
          value: "link",
        },
        {
          text: "Upload Date",
          align: "start",
          sortable: true,
          value: "date",
        },
        {
          text: "Actions",
          align: "end",
          sortable: false,
          value: "delete",
        },
      ],
    };
  },
  watch: {
    dialogAddFile(val) {
      val || this.closeAddFile();
    },
    dialogAddLink(val) {
      val || this.closeAddLink();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },

  components: {
    "send-header": Header,
    "send-footer": Footer
  },
  methods: {
    async onUpload(fileName) {
      let snapshot = await uploadFile(fileName, this.fileData);
      return await snapshot.ref.getDownloadURL();
    },
    closeAddFile() {
      this.resetFile();
      this.dialogAddFile = false;
    },

    closeDelete() {
      this.dialogDelete = false;
    },

    closeAddLink() {
      this.resetLink();
      this.dialogAddLink = false;
    },

    async deleteItemConfirm(item) {
      await deleteResource(item);
      this.render();
      this.closeDelete();
    },

    saveAddLink() {
      if (this.linkName && this.link) {
        updateResources(this.linkName, this.link)
          .then(() => {
            this.dialogAddLink = false;
            this.resetLink();
            this.render();
          })
          .catch(() => {
            this.saveError = "Could not save link";
            this.snackbar = true;
          });
      } else {
        this.saveError = "Please fill all fields before saving";
        this.snackbar = true;
      }
    },
    resetLink() {
      this.linkName = "";
      this.link = "";
    },
    async saveAddFile() {
      if (this.fileData) {
      // If optional file name was provided, use that. Otherwise, use the name of the file that was uploaded
        let fileName = this.fileName ? this.fileName : this.fileData.name;
        try {
          const url = await this.onUpload(fileName);
          updateResources(fileName, url, true);
          this.render();
          this.closeAddFile();
        } catch(err) {
          this.saveError = "Could not upload file";
          this.snackbar = true;
        }
      } else {
        this.resetFile();
        this.saveError = "Please upload a file before saving";
        this.snackbar = true;
      }
    },
    resetFile() {
      this.fileData = null;
      this.fileName = "";
      this.fileURL = "";
      this.uploadValue = 0;
    },
    async render() {
      this.user = await getSignedInUserObj();
      this.resources = await getResources();
    },
    // Conditionally render the actions column for admins
    _headers() {
      return this.user.isAdmin
        ? this.headers
        : this.headers.filter((header) => header.value !== "delete");
    },
    // Enforces that the link is a valid href
    validateLink(link) {
      return /(http(s?)):\/\//i.test(link) ? link : "//" + link;
    },
  },
  created() {
    this.render();
  },
};
</script>