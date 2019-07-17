import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { MyItem } from '../models/my-item';

@Component({
  selector: 'app-list',
  templateUrl: 'list.page.html',
  styleUrls: ['list.page.scss']
})
export class ListPage implements OnInit {
  private icons = [
    {name: 'beer', desc: "Let's just drink beer! 🍺🍺🍺", checked: true}, 
    {name: 'football', desc: "Fútbol!", checked: true}, 
    {name: 'basketball', desc: "NBA rules!!", checked: true}, 
    {name: 'paper-plane', desc: "Paper planes are nice to make", checked: true}, 
    {name: 'american-football', desc: "Let's play football!", checked: true}
  ];
  public items: MyItem[] = [];
  constructor(public dbSvc: DatabaseService) {

    // uncomment this to clear the database and start fresh
    // this.dbSvc.destroyDatabase();
    // return;

    this.dbSvc.getItems()
    .then(dbItems => {
      if (dbItems.length === 0) {
        let item: MyItem;
        let randomIndex: number;
        for (let i = 1; i < 11; i++) {
          randomIndex = Math.floor(Math.random() * this.icons.length);
          item = new MyItem();
          item.note = this.icons[randomIndex].desc;
          item.icon = this.icons[randomIndex].name;
          item._id = String(i);
          dbItems.push(item);
        }
      }
      return (dbItems);
    }).then(dbItems => {
      // if this is a new list of items, save it to database
      if (this.items.length === 0) {
        this.dbSvc.saveItems(dbItems).then(response => {
          // update the _rev versions of saved items
          let responseItem; 
          for (let item of dbItems) {
            responseItem = response.find(elem => {
              return elem.id === item._id;
            })
            item._rev = responseItem.rev;
          }
        });
      }
      // finally set items for UI display
      this.items = dbItems;
    })
  }

  doFilter(iconName: string) {
    let icon = this.icons.find(icon => {return icon.name === iconName});
    icon.checked = !icon.checked;

    this.dbSvc.findByIcons(
      this.icons
        .filter(icon => { return icon.checked })
        .map(icon => { return icon.name })
      ).then(response => {
      this.items = response.docs;
    });
  }

  isChecked(iconName: string): boolean {
    return this.icons.find(icon => {return icon.name === iconName && icon.checked}) !== undefined;
  }

  ngOnInit() {
  }
  // add back when alpha.4 is out
  // navigate(item) {
  //   this.router.navigate(['/list', JSON.stringify(item)]);
  // }
}
