package com.celisapp.dslist.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.celisapp.dslist.dto.GameDto;
import com.celisapp.dslist.entities.Game;
import com.celisapp.dslist.repositories.GameRepository;

@Service
public class GameService {

	@Autowired
	private GameRepository repository;

	public GameDto addGame(Game game) {
		var newGame = repository.save(game);
		return getGameDto(newGame);
	}
	
	public List<GameDto> getGameList() {
		var games = repository.findAll();
		List<GameDto> gamesDto = games.stream().map(game -> getGameDto(game)).toList();
		return gamesDto;
		
	}
	
	private GameDto getGameDto(Game game) {
		var gameDto = new GameDto(game.getId(), game.getTitle(), game.getYear(), game.getGenre(), game.getPlatforms(),
				game.getScore(), game.getImgUrl(), game.getShortDescription(), game.getLongDescription());
		return gameDto;
	}

}
