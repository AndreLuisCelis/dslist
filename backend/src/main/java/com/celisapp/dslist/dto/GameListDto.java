package com.celisapp.dslist.dto;

import com.celisapp.dslist.entities.GameList;

public class GameListDto {
	
	private Long id;
	private String name;
	
	GameListDto(){}

	public GameListDto(Long id, String name) {
		this.id = id;
		this.name = name;
	}
	
	public GameListDto(GameList gameList) {
		id = gameList.getId();
		name = gameList.getName();
	}

	public Long getId() {
		return id;
	}

	public String getName() {
		return name;
	}
	
	
	
	

}
