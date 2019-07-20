import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { MyItem } from '../models/my-item';

PouchDB.plugin(PouchDBFind);

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  db: any = null;

  constructor() { 
    this.db = new PouchDB('mytestdb');
  }

  saveItems(items: MyItem[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.bulkDocs(items).then(response => {
        resolve(response);
      }).catch(error => {
        reject(error);
      });
    });
  }

  getItems(): Promise<MyItem[]> {
    return new Promise((resolve, reject) => {
      let items: MyItem[] = [];
      this.db.allDocs({include_docs: true}).then(response => {
        for (let row of response.rows) {
          items.push(row.doc);
        }
        resolve(items);
      }).catch(error => {
        reject(error);
      });
    });
  }

  findByIcons(iconNames: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      // Create a selector of the form:
      // [
      //   {
      //     'icon': 'beer'
      //   },
      //   {
      //     'icon': 'football'
      //   },
      // ]
      let selectorArray = iconNames.map(iconName => {return {'icon': iconName}});
      this.db.createIndex({
        index: {fields: ['icon']}
      }).then(result => {
        this.db.find({
          selector: 
          { 
            '$or': selectorArray
          },
          //fields: ['_id', 'name'],
          //sort: ['name']
        }).then(function (result) {
          // handle result
          resolve(result);
        }).catch(function (err) {
          reject(err);
        });
      });
    });
  }

  destroyDatabase() {
    this.db.destroy();
  }
}
