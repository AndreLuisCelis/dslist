package com.celisapp.dslist.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.celisapp.dslist.dto.GameDto;
import com.celisapp.dslist.dto.GameListDto;
import com.celisapp.dslist.dto.GameMinDto;
import com.celisapp.dslist.entities.Game;
import com.celisapp.dslist.projection.GameMinProjection;
import com.celisapp.dslist.repositories.GameListRepository;
import com.celisapp.dslist.repositories.GameRepository;

@Service
public class GameService {

	@Autowired
	private GameRepository repository;
	
	@Autowired
	private GameListRepository gameListRepository;

	public GameDto addGame(Game game) {
		var newGame = repository.save(game);
		return getGameDto(newGame);
	}
	
	public List<GameMinDto> getAllGames() {
		var games = repository.findAll();
		List<GameMinDto> gamesMinDto = games.stream().map(game -> new GameMinDto(game)).toList();
		return gamesMinDto;
		
	}
	
	public GameDto getGameById(Long id) {
		Optional<Game> game = repository.findById(id);
		if (game.isPresent()) {
			return new GameDto(game.get());
		} else return null;
	}
	
	public List<GameListDto> getAllGameList(){
		var list = gameListRepository.findAll();
		return list.stream().map(gamelist -> new GameListDto(gamelist)).toList();
	}
	
	public List<GameMinDto> getGameListById(Long gameListId){
		var list = repository.searchByList(gameListId);
		return list.stream().map(game -> new GameMinDto(game)).toList();
	}
	
	private GameDto getGameDto(Game game) {
		var gameDto = new GameDto(game.getId(), game.getTitle(), game.getYear(), game.getGenre(), game.getPlatforms(),
				game.getScore(), game.getImgUrl(), game.getShortDescription(), game.getLongDescription());
		return gameDto;
	}
	
	private GameMinDto getGameMinDto (Game game) {
		return new GameMinDto(game);
	}

}
