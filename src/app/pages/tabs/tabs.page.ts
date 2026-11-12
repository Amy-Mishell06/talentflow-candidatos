import { Component } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { peopleOutline, personAddOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="registro">
          <ion-icon name="person-add-outline"></ion-icon>
          <ion-label>Registrar</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="candidatos">
          <ion-icon name="people-outline"></ion-icon>
          <ion-label>Candidatos</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
})
export class TabsPage {
  constructor() {
    addIcons({ personAddOutline, peopleOutline });
  }
}
