package com.celisapp.dslist.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.celisapp.dslist.dto.GameDto;
import com.celisapp.dslist.dto.GameListDto;
import com.celisapp.dslist.dto.GameMinDto;
import com.celisapp.dslist.entities.Game;
import com.celisapp.dslist.projection.GameMinProjection;
import com.celisapp.dslist.service.GameService;

@RestController()
@RequestMapping("/games")
public class GameController {
	
	@Autowired
	private GameService service;
	
	@GetMapping("")
	private List<GameMinDto> getAllGames(){
		return service.getAllGames();
	}
	
	@GetMapping("/{id}")
	private GameDto getGameById(@PathVariable Long id) {
		return service.getGameById(id);
	}
	
	@GetMapping("/list")
	private List<GameListDto> getAllGamesList() {
		return service.getAllGameList();
	}
	
	@GetMapping("/list/{gameListId}")
	private List<GameMinDto> getGamesListById(@PathVariable Long gameListId) {
		return service.getGameListById(gameListId);
	}
	
	@PostMapping("")
	private GameDto addGame(@RequestBody Game game) {
		 return service.addGame(game);
	}

}
