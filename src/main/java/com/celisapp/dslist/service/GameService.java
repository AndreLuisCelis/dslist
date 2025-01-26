package com.celisapp.dslist.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.celisapp.dslist.dto.GameDto;
import com.celisapp.dslist.dto.GameMinDto;
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
	
	public List<GameMinDto> getGameList() {
		var games = repository.findAll();
		List<GameMinDto> gamesMinDto = games.stream().map(game -> new GameMinDto(game)).toList();
		return gamesMinDto;
		
	}
	
	public GameMinDto getGameById(Long id) {
		Optional<Game> game = repository.findById(id);
		if (game.isPresent()) {
			return new GameMinDto(game.get());
		} else return null;
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
