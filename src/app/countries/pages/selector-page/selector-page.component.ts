import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/country.interfaces';
import { filter, map, switchMap, tap } from 'rxjs';

@Component({
  selector: 'countries-selector-page',
  templateUrl: './selector-page.component.html',
  styles: ``
})
export class SelectorPageComponent implements OnInit {

  public countriesByRegion: SmallCountry[] = [];

  public borders: SmallCountry[] = [];

  public myForm: FormGroup = this.fb.group({
    region: ['', Validators.required ],
    country: ['', Validators.required ],
    border: ['', Validators.required ],
  });

  constructor (
    private fb: FormBuilder,
    private countriesService: CountriesService
  ) {}

  ngOnInit(): void {
    this.onRegionChanged();
    this.onCountryChanged();
  }

  get regions(): Region[] {
    return this.countriesService.regions;
  }

  private onRegionChanged():void {
    this.myForm.get('region')!.valueChanges
      .pipe(
        // Resetea el desplegable de países
        tap( () => this.myForm.get('country')!.setValue('') ),
        tap( () => this.borders= [] ),
        switchMap( region => this.countriesService.getCountriesByRegion(region))
      )
      .subscribe( region => {
        this.countriesByRegion = region
      })
  }

  private onCountryChanged():void {
    this.myForm.get('country')!.valueChanges
      .pipe(
        tap( () => this.myForm.get('border')!.setValue('') ),
        filter( (value:string) => value.length > 0), // Si se cumple la condición, continúa con el switchMap
        switchMap( (alphaCode) => this.countriesService.getCountryByAlphaCode(alphaCode) ),
        switchMap( country => this.countriesService.getCountryBordersByCodes( country.borders ) )
      )
      .subscribe( countries => {
        // this.countriesByRegion = borders
        this.borders = countries;
      })
  }
}
