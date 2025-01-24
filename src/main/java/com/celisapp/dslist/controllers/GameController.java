package com.celisapp.dslist.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController()
@RequestMapping("/games")
public class GameController {
	
	@GetMapping("")
	private String getAllGames(){
		return "Lista de Games completa";
	}

}
