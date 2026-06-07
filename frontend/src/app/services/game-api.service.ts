import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GameDto, GameMinDto } from '../models/game.model';
import { GameListDto } from '../models/game-list.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GameApiService {
  private readonly apiBase = environment.apiBase;

  constructor(private http: HttpClient) {}

  /** GET /games — All games (minimal) */
  getAllGames(): Observable<GameMinDto[]> {
    return this.http.get<GameMinDto[]>(this.apiBase);
  }

  /** GET /games/{id} — Single game (full details) */
  getGameById(id: number): Observable<GameDto> {
    return this.http.get<GameDto>(`${this.apiBase}/${id}`);
  }

  /** GET /games/list — All game lists */
  getGameLists(): Observable<GameListDto[]> {
    return this.http.get<GameListDto[]>(`${this.apiBase}/list`);
  }

  /** GET /games/list/{id} — Games in a specific list */
  getGamesByList(listId: number): Observable<GameMinDto[]> {
    return this.http.get<GameMinDto[]>(`${this.apiBase}/list/${listId}`);
  }

  /** POST /games — Add a new game */
  createGame(game: Partial<GameDto>): Observable<GameDto> {
    return this.http.post<GameDto>(this.apiBase, game);
  }
}
