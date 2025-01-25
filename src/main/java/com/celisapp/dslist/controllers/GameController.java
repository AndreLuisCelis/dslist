package com.celisapp.dslist.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.celisapp.dslist.dto.GameDto;
import com.celisapp.dslist.entities.Game;
import com.celisapp.dslist.service.GameService;

@RestController()
@RequestMapping("/games")
public class GameController {
	
	@Autowired
	private GameService service;
	
	@GetMapping("")
	private List<GameDto> getAllGames(){
		return service.getGameList();
	}
	
	@PostMapping("")
	private GameDto addGame(@RequestBody Game game) {
		 return service.addGame(game);
	}

}
